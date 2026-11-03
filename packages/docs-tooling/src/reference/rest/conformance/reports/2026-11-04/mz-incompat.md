# M/Z incompatibility report — milvus-2.6.26 vs uat-dataplane

Compared 213 cases; **8 incompatibilities** ({"acceptance-diff":8}).

| Case | Category | Milvus | UAT | Detail |
|---|---|---|---|---|
| case.admin.privilege_groups-create | acceptance-diff | PASS | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeCreatePrivilegeGroup: permiss |
| case.admin.privilege_groups-drop | acceptance-diff | PASS | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeDropPrivilegeGroup: permissio |
| case.admin.resource_groups-create | acceptance-diff | RECORDED | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeCreateResourceGroup: permissi |
| case.admin.resource_groups-list | acceptance-diff | PASS | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeListResourceGroups: permissio |
| case.admin.resource_groups-drop | acceptance-diff | RECORDED | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeDropResourceGroup: permission |
| case.admin.databases-alter | acceptance-diff | RECORDED | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeAlterDatabase: permission den |
| case.admin.databases-alter_properties | acceptance-diff | RECORDED | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeAlterDatabase: permission den |
| case.admin.databases-drop_properties | acceptance-diff | RECORDED | REJECTED(record) | rpc error: code = PermissionDenied desc = PrivilegeAlterDatabase: permission den |
