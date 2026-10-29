# Architecture rules

- Resolve staff permissions from the protected user_roles table, never from browser storage or user metadata; read-only staff must be denied writes by the database as well as the UI.
- Username-only staff login uses a normalized synthetic auth address and a unique protected profiles username; existing email admin login remains available.
- OwnerAccess keeps read-only staff out of owner management screens while preserving signed-out owner access; product RPCs independently reject reader sessions before any side effect.