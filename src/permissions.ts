// Internal permissions can be defined here.
// They are useful when the underlying database does not have that capability or when the database is not under your control to define api specific roles.
// Permission system is modeled after PostgreSql GRANT + RLS functionality.
// If the permissions array is empty, the internal permission system is disabled and assumes that the underlying database has the
// necessary permissions configured.


export default [
    {
        "name": "allow full access to opportunities for authenticated users",
        "table_schema": "public","table_name": "opportunities",
        "role": "authenticated",
        "grant": ["all"],
        "policy_for": ["select", "insert", "update", "delete"],
        "using": [{"sql": "true"}],
        "check": [{"sql": "true"}],
    },
    {
        "name": "allow full access to opportunities for authenticated users",
        "table_schema": "public","table_name": "stages",
        "role": "authenticated",
        "grant": ["all"],
        "policy_for": ["select", "insert", "update", "delete"],
        "using": [{"sql": "true"}],
        "check": [{"sql": "true"}],
    },
]
