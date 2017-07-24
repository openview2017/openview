#!/bin/sh

# 1. Install openview-ui
kubectl apply -f openview-ui.yaml

# 2. Install network-control-plugin
kubectl apply -f network-control-plugin.yaml
