#!/bin/bash
# Tunnel SSH vers MySQL AlwaysData — laisser ce terminal ouvert
echo "Tunnel SSH → MySQL AlwaysData (port local 3307)"
echo "Laissez ce terminal ouvert pendant le développement."
echo ""
exec ssh -L 3307:mysql-stellouuu.alwaysdata.net:3306 stellouuu@ssh-stellouuu.alwaysdata.net -N
