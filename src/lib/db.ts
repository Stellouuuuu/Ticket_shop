import mysql from "mysql2/promise";
import type { OrderStatus, TeamMember, TicketType } from "./constants";
import { getPoolConfig, isRetryableDbError } from "./db-config";

export interface Order {
  id: number;
  reference: string;
  full_name: string;
  phone: string;
  email: string;
  delivery_zone: string;
  ticket_type: TicketType;
  ticket_count: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  assigned_to: TeamMember | null;
  delivery_date: string | null;
  internal_note: string | null;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  full_name: string;
  phone: string;
  email: string;
  delivery_zone: string;
  ticket_type: TicketType;
  ticket_count: number;
  customer_note?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  assigned_to?: TeamMember | null;
  delivery_date?: string | null;
  internal_note?: string | null;
}

let pool: mysql.Pool | null = null;

export function resetPool(): void {
  if (pool) {
    pool.end().catch(() => undefined);
    pool = null;
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(getPoolConfig());
  }
  return pool;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDbRetry<T>(
  operation: (db: mysql.Pool) => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation(getPool());
    } catch (error) {
      lastError = error;
      if (!isRetryableDbError(error) || attempt === retries - 1) {
        throw error;
      }
      resetPool();
      await sleep(800 * (attempt + 1));
    }
  }

  throw lastError;
}

export async function createOrder(
  input: CreateOrderInput,
  reference: string,
  unitPrice: number,
  totalAmount: number
): Promise<Order> {
  return withDbRetry(async (db) => {
    const [result] = await db.execute<mysql.ResultSetHeader>(
      `INSERT INTO orders (
        reference, full_name, phone, email, delivery_zone, ticket_type,
        ticket_count, unit_price, total_amount, status, customer_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        reference,
        input.full_name.trim(),
        input.phone.trim(),
        input.email.trim(),
        input.delivery_zone.trim(),
        input.ticket_type,
        input.ticket_count,
        unitPrice,
        totalAmount,
        input.customer_note?.trim() || null,
      ]
    );

    const order = await getOrderById(result.insertId);
    if (!order) throw new Error("Commande créée mais introuvable");
    return order;
  });
}

export async function getOrderByReference(
  reference: string
): Promise<Order | null> {
  const db = getPool();
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM orders WHERE reference = ?",
    [reference]
  );
  return rows[0] ? (rows[0] as Order) : null;
}

export async function getOrderById(id: number): Promise<Order | null> {
  const db = getPool();
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM orders WHERE id = ?",
    [id]
  );
  return rows[0] ? (rows[0] as Order) : null;
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getPool();
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM orders ORDER BY created_at DESC"
  );
  return rows as Order[];
}

export async function updateOrder(
  id: number,
  input: UpdateOrderInput
): Promise<Order | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.status !== undefined) {
    fields.push("status = ?");
    values.push(input.status);
  }
  if (input.assigned_to !== undefined) {
    fields.push("assigned_to = ?");
    values.push(input.assigned_to);
  }
  if (input.delivery_date !== undefined) {
    fields.push("delivery_date = ?");
    values.push(input.delivery_date);
  }
  if (input.internal_note !== undefined) {
    fields.push("internal_note = ?");
    values.push(input.internal_note);
  }

  if (fields.length === 0) return getOrderById(id);

  values.push(id);
  const db = getPool();
  await db.execute(
    `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
    values as (string | number | null)[]
  );
  return getOrderById(id);
}

export function generateReference(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FCH-${y}${m}${d}-${rand}`;
}
