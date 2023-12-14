// Internal permissions can be defined here.
// They are useful when the underlying database does not have that capability or when the database is not under your control to define api specific roles.
// Permission system is modeled after PostgreSql GRANT + RLS functionality.
// If the permissions array is empty, the internal permission system is disabled and assumes that the underlying database has the
// necessary permissions configured.


export default [
    {
        "name": "allow full access to todos for authenticated users",
        "table_schema": "public","table_name": "todos",
        "role": "authenticated",
        "grant": ["all"],
        "policy_for": ["select", "insert", "update", "delete"],
        "using": [{
            "column": "user_id", "op": "eq", "env": "request.jwt.claims", "env_part": "sub"
        }],
        "check": [{
            "column": "user_id", "op": "eq", "env": "request.jwt.claims", "env_part": "sub"
        }]
    },
]


    // other examples
    // {
    //     "name": "public can see rows marked as public",
    //     "table_schema": "public", "table_name": "permissions_check",
    //     "role": "public",
    //     "grant": ["select"], "columns": ["id", "value"],
    //     "policy_for": ["select"], 
    //     "using": [{"column":"public","op":"eq","val":"1"}]
    // },
    // {
    //     "name": "validation for hidden value",
    //     "table_schema": "public", "table_name": "permissions_check",
    //     "role": "public",
    //     "restrictive": true,
    //     "check": [{
    //         "tree":{
    //             "logic_op":"or",
    //             "conditions":[
    //                 {"column":"hidden","op":"eq","val":"Hidden"},
    //                 {"column":"hidden","op":"eq","val":"Hidden changed"}
    //             ]
    //         }
    //     }]
    // },
    // {
    //     "name": "admin allow all",
    //     "table_schema": "public", "table_name": "permissions_check",
    //     "role": "admin",
    //     "grant": ["select", "insert", "update", "delete"],
    //     "policy_for": ["select", "insert", "update", "delete"],
    //     "using": [{"sql":"true"}],
    //     "check": [{"sql":"true"}]
    // },
    // {
    //     "name": "alice allow owned",
    //     "table_schema": "public","table_name": "permissions_check",
    //     "role": "alice",
    //     "grant": ["all"],
    //     "policy_for": ["select", "insert", "update", "delete"],
    //     "using": [{"column":"role","op":"eq","env":"request.jwt.claims","env_part":"role"}],
    //     "check": [{"column":"role","op":"eq","env":"request.jwt.claims","env_part":"role"}]
    // },
    // {
    //     "name": "bob allow owned",
    //     "table_schema": "public","table_name": "permissions_check",
    //     "role": "bob",
    //     "grant": ["all"],
    //     "policy_for": ["all"],
    //     "using": [{"column":"role","op":"eq","val":"bob"}],
    //     "check": [{"column":"role","op":"eq","val":"bob"}]
    // },