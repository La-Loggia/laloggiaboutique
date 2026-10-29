# Architecture rules

- Resolve staff permissions from the protected user_roles table, never from browser storage or user metadata; read-only staff must be denied writes by the database as well as the UI.
- Username-only staff login uses a normalized synthetic auth address and a unique protected profiles username; existing email admin login remains available.