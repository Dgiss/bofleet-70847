#!/bin/bash

echo "=== RÉGÉNÉRATION GRAPHQL FILES ==="
echo "Suppression des fichiers corrompus..."
rm -f src/graphql/mutations.ts src/graphql/queries.ts src/graphql/subscriptions.ts

echo "=== EXECUTING AMPLIFY CODEGEN ==="
amplify codegen

echo "=== VÉRIFICATION DES FICHIERS GÉNÉRÉS ==="
ls -la src/graphql/
echo "=== CODEGEN COMPLETE ==="