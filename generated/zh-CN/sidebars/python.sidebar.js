module.exports = [
  {
    "type": "category",
    "label": "DataImport",
    "key": "category:api/python/python/dataimport",
    "items": [
      {
        "type": "doc",
        "id": "api/python/python/DataImport/DataImport-BulkFileType",
        "label": "BulkFileType",
        "key": "doc:api/python/python/DataImport/dataimport-bulkfiletype"
      },
      {
        "type": "category",
        "label": "BulkImport",
        "key": "category:api/python/python/DataImport/dataimport-bulkimport",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-BulkImport/BulkImport-bulk_import",
            "label": "bulk_import()",
            "key": "doc:api/python/python/DataImport/DataImport-BulkImport/bulkimport-bulkimport"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-BulkImport/BulkImport-get_import_progress",
            "label": "get_import_progress()",
            "key": "doc:api/python/python/DataImport/DataImport-BulkImport/bulkimport-getimportprogress"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-BulkImport/BulkImport-list_import_jobs",
            "label": "list_import_jobs()",
            "key": "doc:api/python/python/DataImport/DataImport-BulkImport/bulkimport-listimportjobs"
          }
        ]
      },
      {
        "type": "category",
        "label": "LocalBulkWriter",
        "key": "category:api/python/python/DataImport/dataimport-localbulkwriter",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-LocalBulkWriter/LocalBulkWriter-append_row",
            "label": "append_row()",
            "key": "doc:api/python/python/DataImport/DataImport-LocalBulkWriter/localbulkwriter-appendrow"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-LocalBulkWriter/LocalBulkWriter-commit",
            "label": "commit()",
            "key": "doc:api/python/python/DataImport/DataImport-LocalBulkWriter/localbulkwriter-commit"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-LocalBulkWriter/DataImport-LocalBulkWriter",
            "label": "LocalBulkWriter",
            "key": "doc:api/python/python/DataImport/DataImport-LocalBulkWriter/dataimport-localbulkwriter"
          }
        ]
      },
      {
        "type": "category",
        "label": "RemoteBulkWriter",
        "key": "category:api/python/python/DataImport/dataimport-remotebulkwriter",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-append_row",
            "label": "append_row()",
            "key": "doc:api/python/python/DataImport/DataImport-RemoteBulkWriter/remotebulkwriter-appendrow"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-AzureConnectParam",
            "label": "AzureConnectParam",
            "key": "doc:api/python/python/DataImport/DataImport-RemoteBulkWriter/remotebulkwriter-azureconnectparam"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-commit",
            "label": "commit()",
            "key": "doc:api/python/python/DataImport/DataImport-RemoteBulkWriter/remotebulkwriter-commit"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/DataImport-RemoteBulkWriter",
            "label": "RemoteBulkWriter",
            "key": "doc:api/python/python/DataImport/DataImport-RemoteBulkWriter/dataimport-remotebulkwriter"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-S3ConnectParam",
            "label": "S3ConnectParam",
            "key": "doc:api/python/python/DataImport/DataImport-RemoteBulkWriter/remotebulkwriter-s3connectparam"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "MilvusClient",
    "key": "category:api/python/python/milvusclient",
    "items": [
      {
        "type": "category",
        "label": "Authentication",
        "key": "category:api/python/python/MilvusClient/milvusclient-authentication",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-create_role",
            "label": "create_role()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-createrole"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-create_user",
            "label": "create_user()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-createuser"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-describe_role",
            "label": "describe_role()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-describerole"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-describe_user",
            "label": "describe_user()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-describeuser"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-drop_role",
            "label": "drop_role()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-droprole"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-drop_user",
            "label": "drop_user()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-dropuser"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-grant_privilege_v2",
            "label": "grant_privilege_v2()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-grantprivilegev2"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-grant_role",
            "label": "grant_role()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-grantrole"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-list_privilege_groups",
            "label": "list_privilege_groups()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-listprivilegegroups"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-list_roles",
            "label": "list_roles()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-listroles"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-list_users",
            "label": "list_users()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-listusers"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-revoke_privilege_v2",
            "label": "revoke_privilege_v2()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-revokeprivilegev2"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-revoke_role",
            "label": "revoke_role()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-revokerole"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-update_password",
            "label": "update_password()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-updatepassword"
          }
        ]
      },
      {
        "type": "category",
        "label": "Client",
        "key": "category:api/python/python/MilvusClient/milvusclient-client",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Client/Client-close",
            "label": "close()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Client/client-close"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Client/Client-MilvusClient",
            "label": "MilvusClient",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Client/client-milvusclient"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Client/Client-AsyncMilvusClient",
            "label": "AsyncMilvusClient",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Client/client-asyncmilvusclient"
          }
        ]
      },
      {
        "type": "category",
        "label": "Collections",
        "key": "category:api/python/python/MilvusClient/milvusclient-collections",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-alter_alias",
            "label": "alter_alias()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-alteralias"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-alter_collection_field",
            "label": "alter_collection_field()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-altercollectionfield"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-alter_collection_properties",
            "label": "alter_collection_properties()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-altercollectionproperties"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_alias",
            "label": "create_alias()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-createalias"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_collection",
            "label": "create_collection()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-createcollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_schema",
            "label": "create_schema()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-createschema"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-DataType",
            "label": "DataType",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-datatype"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-describe_alias",
            "label": "describe_alias()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-describealias"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-describe_collection",
            "label": "describe_collection()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-describecollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_alias",
            "label": "drop_alias()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-dropalias"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_collection",
            "label": "drop_collection()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-dropcollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_collection_properties",
            "label": "drop_collection_properties()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-dropcollectionproperties"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-get_collection_stats",
            "label": "get_collection_stats()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-getcollectionstats"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-has_collection",
            "label": "has_collection()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-hascollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-IndexType",
            "label": "IndexType",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-indextype"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-list_aliases",
            "label": "list_aliases()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-listaliases"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-list_collections",
            "label": "list_collections()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-listcollections"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-rename_collection",
            "label": "rename_collection()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-renamecollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-FunctionType",
            "label": "FunctionType",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-functiontype"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-add_collection_field",
            "label": "add_collection_field()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Collections/collections-addcollectionfield"
          }
        ]
      },
      {
        "type": "category",
        "label": "CollectionSchema",
        "key": "category:api/python/python/MilvusClient/milvusclient-collectionschema",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/MilvusClient-CollectionSchema",
            "label": "CollectionSchema",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-CollectionSchema/milvusclient-collectionschema"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/CollectionSchema-run_analyzer",
            "label": "run_analyzer()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-CollectionSchema/collectionschema-runanalyzer"
          }
        ]
      },
      {
        "type": "category",
        "label": "Management",
        "key": "category:api/python/python/MilvusClient/milvusclient-management",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-add_index",
            "label": "add_index()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-addindex"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-compact",
            "label": "compact()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-compact"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-create_index",
            "label": "create_index()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-createindex"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-describe_index",
            "label": "describe_index()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-describeindex"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-drop_index",
            "label": "drop_index()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-dropindex"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-flush",
            "label": "flush()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-flush"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-get_compact_state",
            "label": "get_compact_state()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-getcompactstate"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-get_load_state",
            "label": "get_load_state()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-getloadstate"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-list_indexes",
            "label": "list_indexes()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-listindexes"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-load_collection",
            "label": "load_collection()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-loadcollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-prepare_index_params",
            "label": "prepare_index_params()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-prepareindexparams"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-refresh_load",
            "label": "refresh_load()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-refreshload"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-release_collection",
            "label": "release_collection()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-releasecollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-alter_index_properties",
            "label": "alter_index_properties()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-alterindexproperties"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-drop_index_properties",
            "label": "drop_index_properties()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Management/management-dropindexproperties"
          }
        ]
      },
      {
        "type": "category",
        "label": "Partitions",
        "key": "category:api/python/python/MilvusClient/milvusclient-partitions",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-create_partition",
            "label": "create_partition()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Partitions/partitions-createpartition"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-drop_partition",
            "label": "drop_partition()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Partitions/partitions-droppartition"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-get_partition_stats",
            "label": "get_partition_stats()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Partitions/partitions-getpartitionstats"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-has_partition",
            "label": "has_partition()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Partitions/partitions-haspartition"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-list_partitions",
            "label": "list_partitions()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Partitions/partitions-listpartitions"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-load_partitions",
            "label": "load_partitions()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Partitions/partitions-loadpartitions"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-release_partitions",
            "label": "release_partitions()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Partitions/partitions-releasepartitions"
          }
        ]
      },
      {
        "type": "category",
        "label": "Vector",
        "key": "category:api/python/python/MilvusClient/milvusclient-vector",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-delete",
            "label": "delete()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-delete"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-get",
            "label": "get()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-get"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-insert",
            "label": "insert()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-insert"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-query",
            "label": "query()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-query"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-query_iterator",
            "label": "query_iterator()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-queryiterator"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-search",
            "label": "search()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-search"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-search_iterator",
            "label": "search_iterator()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-searchiterator"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-upsert",
            "label": "upsert()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-upsert"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-hybrid_search",
            "label": "hybrid_search()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Vector/vector-hybridsearch"
          }
        ]
      },
      {
        "type": "category",
        "label": "Database",
        "key": "category:api/python/python/MilvusClient/milvusclient-database",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-alter_database_properties",
            "label": "alter_database_properties()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Database/database-alterdatabaseproperties"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-create_database",
            "label": "create_database()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Database/database-createdatabase"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-describe_database",
            "label": "describe_database()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Database/database-describedatabase"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-drop_database",
            "label": "drop_database()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Database/database-dropdatabase"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-drop_database_properties",
            "label": "drop_database_properties()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Database/database-dropdatabaseproperties"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-list_databases",
            "label": "list_databases()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Database/database-listdatabases"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-using_database",
            "label": "using_database()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Database/database-usingdatabase"
          }
        ]
      },
      {
        "type": "category",
        "label": "Function",
        "key": "category:api/python/python/MilvusClient/milvusclient-function",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-add_function",
            "label": "add_function()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Function/function-addfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-construct_from_dict",
            "label": "construct_from_dict()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Function/function-constructfromdict"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/MilvusClient-Function",
            "label": "Function",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Function/milvusclient-function"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-to_dict",
            "label": "to_dict()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Function/function-todict"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-verify",
            "label": "verify()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-Function/function-verify"
          }
        ]
      },
      {
        "type": "category",
        "label": "EmbeddingList",
        "key": "category:api/python/python/MilvusClient/milvusclient-embeddinglist",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-add",
            "label": "add()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-EmbeddingList/embeddinglist-add"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-add_batch",
            "label": "add_batch()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-EmbeddingList/embeddinglist-addbatch"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-clear",
            "label": "clear()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-EmbeddingList/embeddinglist-clear"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/MilvusClient-EmbeddingList",
            "label": "EmbeddingList",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-EmbeddingList/milvusclient-embeddinglist"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-to_flat_array",
            "label": "to_flat_array()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-EmbeddingList/embeddinglist-toflatarray"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-to_numpy",
            "label": "to_numpy()",
            "key": "doc:api/python/python/MilvusClient/MilvusClient-EmbeddingList/embeddinglist-tonumpy"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Volume",
    "key": "category:api/python/python/volume",
    "items": [
      {
        "type": "category",
        "label": "VolumeFileManager",
        "key": "category:api/python/python/Volume/volume-volumefilemanager",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeFileManager/VolumeFileManager-upload_file_to_volume",
            "label": "upload_file_to_volume()",
            "key": "doc:api/python/python/Volume/Volume-VolumeFileManager/volumefilemanager-uploadfiletovolume"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeFileManager/Volume-VolumeFileManager",
            "label": "VolumeFileManager",
            "key": "doc:api/python/python/Volume/Volume-VolumeFileManager/volume-volumefilemanager"
          }
        ]
      },
      {
        "type": "category",
        "label": "VolumeManager",
        "key": "category:api/python/python/Volume/volume-volumemanager",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/VolumeManager-create_volume",
            "label": "create_volume()",
            "key": "doc:api/python/python/Volume/Volume-VolumeManager/volumemanager-createvolume"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/VolumeManager-delete_volume",
            "label": "delete_volume()",
            "key": "doc:api/python/python/Volume/Volume-VolumeManager/volumemanager-deletevolume"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/VolumeManager-list_volumes",
            "label": "list_volumes()",
            "key": "doc:api/python/python/Volume/Volume-VolumeManager/volumemanager-listvolumes"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/Volume-VolumeManager",
            "label": "VolumeManager",
            "key": "doc:api/python/python/Volume/Volume-VolumeManager/volume-volumemanager"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "EmbeddingModels",
    "key": "category:api/python/python/embeddingmodels",
    "items": [
      {
        "type": "category",
        "label": "BGEM3EmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-bgem3embeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/EmbeddingModels-BGEM3EmbeddingFunction",
            "label": "BGEM3EmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/embeddingmodels-bgem3embeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/BGEM3EmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/bgem3embeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/BGEM3EmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/bgem3embeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/BGEM3EmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/bgem3embeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "CohereEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-cohereembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/EmbeddingModels-CohereEmbeddingFunction",
            "label": "CohereEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/embeddingmodels-cohereembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/CohereEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/cohereembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/CohereEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/cohereembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/CohereEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/cohereembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "InstructorEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-instructorembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/InstructorEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/instructorembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/InstructorEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/instructorembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/EmbeddingModels-InstructorEmbeddingFunction",
            "label": "InstructorEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/embeddingmodels-instructorembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/InstructorEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/instructorembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "JinaEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-jinaembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/JinaEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/jinaembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/JinaEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/jinaembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/EmbeddingModels-JinaEmbeddingFunction",
            "label": "JinaEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/embeddingmodels-jinaembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/JinaEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/jinaembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "MGTEEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-mgteembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/MGTEEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/mgteembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/MGTEEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/mgteembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/EmbeddingModels-MGTEEmbeddingFunction",
            "label": "MGTEEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/embeddingmodels-mgteembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/MGTEEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/mgteembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "MistralAIEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-mistralaiembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/MistralAIEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/mistralaiembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/MistralAIEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/mistralaiembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/EmbeddingModels-MistralAIEmbeddingFunction",
            "label": "MistralAIEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/embeddingmodels-mistralaiembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/MistralAIEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/mistralaiembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "NomicEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-nomicembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/NomicEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/nomicembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/NomicEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/nomicembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/EmbeddingModels-NomicEmbeddingFunction",
            "label": "NomicEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/embeddingmodels-nomicembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/NomicEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/nomicembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "OnnxEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-onnxembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/OnnxEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/onnxembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/OnnxEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/onnxembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/EmbeddingModels-OnnxEmbeddingFunction",
            "label": "OnnxEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/embeddingmodels-onnxembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/OnnxEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/onnxembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "OpenAIEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-openaiembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/OpenAIEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/openaiembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/OpenAIEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/openaiembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/EmbeddingModels-OpenAIEmbeddingFunction",
            "label": "OpenAIEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/embeddingmodels-openaiembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/OpenAIEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/openaiembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "SentenceTransformerEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-sentencetransformerembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/SentenceTransformerEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/sentencetransformerembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/SentenceTransformerEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/sentencetransformerembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/EmbeddingModels-SentenceTransformerEmbeddingFunction",
            "label": "SentenceTransformerEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/embeddingmodels-sentencetransformerembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/SentenceTransformerEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/sentencetransformerembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "SpladeEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-spladeembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/SpladeEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/spladeembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/SpladeEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/spladeembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/EmbeddingModels-SpladeEmbeddingFunction",
            "label": "SpladeEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/embeddingmodels-spladeembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/SpladeEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/spladeembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "VoyageEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-voyageembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/VoyageEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/voyageembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/VoyageEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/voyageembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/EmbeddingModels-VoyageEmbeddingFunction",
            "label": "VoyageEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/embeddingmodels-voyageembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/VoyageEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/voyageembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "GeminiEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-geminiembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/GeminiEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/geminiembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/GeminiEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/geminiembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/EmbeddingModels-GeminiEmbeddingFunction",
            "label": "GeminiEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/embeddingmodels-geminiembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/GeminiEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/geminiembeddingfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "Model2VecEmbeddingFunction",
        "key": "category:api/python/python/EmbeddingModels/embeddingmodels-model2vecembeddingfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/Model2VecEmbeddingFunction-encode_documents",
            "label": "encode_documents()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/model2vecembeddingfunction-encodedocuments"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/Model2VecEmbeddingFunction-encode_queries",
            "label": "encode_queries()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/model2vecembeddingfunction-encodequeries"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/EmbeddingModels-Model2VecEmbeddingFunction",
            "label": "Model2VecEmbeddingFunction",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/embeddingmodels-model2vecembeddingfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/Model2VecEmbeddingFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/model2vecembeddingfunction-call"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "ORM",
    "key": "category:api/python/python/orm",
    "items": [
      {
        "type": "category",
        "label": "Collection",
        "key": "category:api/python/python/ORM/orm-collection",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/ORM-Collection",
            "label": "Collection",
            "key": "doc:api/python/python/ORM/ORM-Collection/orm-collection"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-compact",
            "label": "compact()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-compact"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-construct_from_dataframe",
            "label": "construct_from_dataframe()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-constructfromdataframe"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-create_index",
            "label": "create_index()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-createindex"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-create_partition",
            "label": "create_partition()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-createpartition"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-delete",
            "label": "delete()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-delete"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-describe",
            "label": "describe()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-describe"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-drop",
            "label": "drop()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-drop"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-drop_index",
            "label": "drop_index()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-dropindex"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-drop_partition",
            "label": "drop_partition()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-droppartition"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-flush",
            "label": "flush()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-flush"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-get_compaction_plans",
            "label": "get_compaction_plans()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-getcompactionplans"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-get_compaction_state",
            "label": "get_compaction_state()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-getcompactionstate"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-get_replicas",
            "label": "get_replicas()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-getreplicas"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-has_index",
            "label": "has_index()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-hasindex"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-has_partition",
            "label": "has_partition()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-haspartition"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-hybrid_search",
            "label": "hybrid_search()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-hybridsearch"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-index",
            "label": "index()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-index"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-insert",
            "label": "insert()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-insert"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-load",
            "label": "load()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-load"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-partition",
            "label": "partition()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-partition"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-query",
            "label": "query()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-query"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-query_iterator",
            "label": "query_iterator()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-queryiterator"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-release",
            "label": "release()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-release"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-search",
            "label": "search()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-search"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-search_iterator",
            "label": "search_iterator()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-searchiterator"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-set_properties",
            "label": "set_properties()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-setproperties"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-upsert",
            "label": "upsert()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-upsert"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-wait_for_compaction_completed",
            "label": "wait_for_compaction_completed()",
            "key": "doc:api/python/python/ORM/ORM-Collection/collection-waitforcompactioncompleted"
          }
        ]
      },
      {
        "type": "category",
        "label": "CollectionSchema",
        "key": "category:api/python/python/ORM/orm-collectionschema",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-CollectionSchema/ORM-CollectionSchema",
            "label": "CollectionSchema",
            "key": "doc:api/python/python/ORM/ORM-CollectionSchema/orm-collectionschema"
          }
        ]
      },
      {
        "type": "category",
        "label": "Connections",
        "key": "category:api/python/python/ORM/orm-connections",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-add_connection",
            "label": "add_connection()",
            "key": "doc:api/python/python/ORM/ORM-Connections/connections-addconnection"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-connect",
            "label": "connect()",
            "key": "doc:api/python/python/ORM/ORM-Connections/connections-connect"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/ORM-Connections",
            "label": "Connections",
            "key": "doc:api/python/python/ORM/ORM-Connections/orm-connections"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-disconnect",
            "label": "disconnect()",
            "key": "doc:api/python/python/ORM/ORM-Connections/connections-disconnect"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-get_connection_addr",
            "label": "get_connection_addr()",
            "key": "doc:api/python/python/ORM/ORM-Connections/connections-getconnectionaddr"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-has_connection",
            "label": "has_connection()",
            "key": "doc:api/python/python/ORM/ORM-Connections/connections-hasconnection"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-list_connections",
            "label": "list_connections()",
            "key": "doc:api/python/python/ORM/ORM-Connections/connections-listconnections"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-remove_connection",
            "label": "remove_connection()",
            "key": "doc:api/python/python/ORM/ORM-Connections/connections-removeconnection"
          }
        ]
      },
      {
        "type": "category",
        "label": "db",
        "key": "category:api/python/python/ORM/orm-db",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-create_database",
            "label": "create_database()",
            "key": "doc:api/python/python/ORM/ORM-db/db-createdatabase"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-drop_database",
            "label": "drop_database()",
            "key": "doc:api/python/python/ORM/ORM-db/db-dropdatabase"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-list_database",
            "label": "list_database()",
            "key": "doc:api/python/python/ORM/ORM-db/db-listdatabase"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-using_database",
            "label": "using_database()",
            "key": "doc:api/python/python/ORM/ORM-db/db-usingdatabase"
          }
        ]
      },
      {
        "type": "category",
        "label": "FieldSchema",
        "key": "category:api/python/python/ORM/orm-fieldschema",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-FieldSchema/FieldSchema-construct_from_dict",
            "label": "construct_from_dict()",
            "key": "doc:api/python/python/ORM/ORM-FieldSchema/fieldschema-constructfromdict"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-FieldSchema/ORM-FieldSchema",
            "label": "FieldSchema",
            "key": "doc:api/python/python/ORM/ORM-FieldSchema/orm-fieldschema"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-FieldSchema/FieldSchema-to_dict",
            "label": "to_dict()",
            "key": "doc:api/python/python/ORM/ORM-FieldSchema/fieldschema-todict"
          }
        ]
      },
      {
        "type": "category",
        "label": "Partition",
        "key": "category:api/python/python/ORM/orm-partition",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-delete",
            "label": "delete()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-delete"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-drop",
            "label": "drop()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-drop"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-flush",
            "label": "flush()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-flush"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-get_replicas",
            "label": "get_replicas()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-getreplicas"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-insert",
            "label": "insert()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-insert"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-load",
            "label": "load()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-load"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/ORM-Partition",
            "label": "Partition",
            "key": "doc:api/python/python/ORM/ORM-Partition/orm-partition"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-query",
            "label": "query()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-query"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-release",
            "label": "release()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-release"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-search",
            "label": "search()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-search"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-upsert",
            "label": "upsert()",
            "key": "doc:api/python/python/ORM/ORM-Partition/partition-upsert"
          }
        ]
      },
      {
        "type": "category",
        "label": "Role",
        "key": "category:api/python/python/ORM/orm-role",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-add_user",
            "label": "add_user()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-adduser"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-create",
            "label": "create()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-create"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-drop",
            "label": "drop()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-drop"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-get_users",
            "label": "get_users()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-getusers"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-grant",
            "label": "grant()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-grant"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-is_exist",
            "label": "is_exist()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-isexist"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-list_grant",
            "label": "list_grant()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-listgrant"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-list_grants",
            "label": "list_grants()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-listgrants"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-remove_user",
            "label": "remove_user()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-removeuser"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-revoke",
            "label": "revoke()",
            "key": "doc:api/python/python/ORM/ORM-Role/role-revoke"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/ORM-Role",
            "label": "Role",
            "key": "doc:api/python/python/ORM/ORM-Role/orm-role"
          }
        ]
      },
      {
        "type": "category",
        "label": "utility",
        "key": "category:api/python/python/ORM/orm-utility",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-alter_alias",
            "label": "alter_alias()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-alteralias"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-BulkInsertState",
            "label": "BulkInsertState",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-bulkinsertstate"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-create_alias",
            "label": "create_alias()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-createalias"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-create_resource_group",
            "label": "create_resource_group()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-createresourcegroup"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-create_user",
            "label": "create_user()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-createuser"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-delete_user",
            "label": "delete_user()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-deleteuser"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-describe_resource_group",
            "label": "describe_resource_group()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-describeresourcegroup"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-do_bulk_insert",
            "label": "do_bulk_insert()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-dobulkinsert"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-drop_alias",
            "label": "drop_alias()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-dropalias"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-drop_collection",
            "label": "drop_collection()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-dropcollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-drop_resource_group",
            "label": "drop_resource_group()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-dropresourcegroup"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-flush_all",
            "label": "flush_all()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-flushall"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_bulk_insert_state",
            "label": "get_bulk_insert_state()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-getbulkinsertstate"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_query_segment_info",
            "label": "get_query_segment_info()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-getquerysegmentinfo"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_server_type",
            "label": "get_server_type()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-getservertype"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_server_version",
            "label": "get_server_version()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-getserverversion"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-has_collection",
            "label": "has_collection()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-hascollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-has_partition",
            "label": "has_partition()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-haspartition"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-hybridts_to_datetime",
            "label": "hybridts_to_datetime()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-hybridtstodatetime"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-hybridts_to_unixtime",
            "label": "hybridts_to_unixtime()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-hybridtstounixtime"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-index_building_progress",
            "label": "index_building_progress()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-indexbuildingprogress"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_aliases",
            "label": "list_aliases()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listaliases"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_bulk_insert_tasks",
            "label": "list_bulk_insert_tasks()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listbulkinserttasks"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_collections",
            "label": "list_collections()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listcollections"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_indexes",
            "label": "list_indexes()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listindexes"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_resource_groups",
            "label": "list_resource_groups()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listresourcegroups"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_roles",
            "label": "list_roles()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listroles"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_user",
            "label": "list_user()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listuser"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_usernames",
            "label": "list_usernames()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listusernames"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_users",
            "label": "list_users()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-listusers"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-loading_progress",
            "label": "loading_progress()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-loadingprogress"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-load_balance",
            "label": "load_balance()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-loadbalance"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-load_state",
            "label": "load_state()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-loadstate"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-mkts_from_datetime",
            "label": "mkts_from_datetime()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-mktsfromdatetime"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-mkts_from_hybridts",
            "label": "mkts_from_hybridts()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-mktsfromhybridts"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-mkts_from_unixtime",
            "label": "mkts_from_unixtime()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-mktsfromunixtime"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-rename_collection",
            "label": "rename_collection()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-renamecollection"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-reset_password",
            "label": "reset_password()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-resetpassword"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-transfer_node",
            "label": "transfer_node()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-transfernode"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-transfer_replica",
            "label": "transfer_replica()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-transferreplica"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-update_password",
            "label": "update_password()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-updatepassword"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-wait_for_index_building_complete",
            "label": "wait_for_index_building_complete()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-waitforindexbuildingcomplete"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-wait_for_loading_complete",
            "label": "wait_for_loading_complete()",
            "key": "doc:api/python/python/ORM/ORM-utility/utility-waitforloadingcomplete"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Rerankers",
    "key": "category:api/python/python/rerankers",
    "items": [
      {
        "type": "category",
        "label": "BGERerankFunction",
        "key": "category:api/python/python/Rerankers/rerankers-bgererankfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-BGERerankFunction/Rerankers-BGERerankFunction",
            "label": "BGERerankFunction",
            "key": "doc:api/python/python/Rerankers/Rerankers-BGERerankFunction/rerankers-bgererankfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-BGERerankFunction/BGERerankFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/Rerankers/Rerankers-BGERerankFunction/bgererankfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "CohereRerankFunction",
        "key": "category:api/python/python/Rerankers/rerankers-coherererankfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CohereRerankFunction/Rerankers-CohereRerankFunction",
            "label": "CohereRerankFunction",
            "key": "doc:api/python/python/Rerankers/Rerankers-CohereRerankFunction/rerankers-coherererankfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CohereRerankFunction/CohereRerankFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/Rerankers/Rerankers-CohereRerankFunction/coherererankfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "CrossEncoderRerankFunction",
        "key": "category:api/python/python/Rerankers/rerankers-crossencoderrerankfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CrossEncoderRerankFunction/Rerankers-CrossEncoderRerankFunction",
            "label": "CrossEncoderRerankFunction",
            "key": "doc:api/python/python/Rerankers/Rerankers-CrossEncoderRerankFunction/rerankers-crossencoderrerankfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CrossEncoderRerankFunction/CrossEncoderRerankFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/Rerankers/Rerankers-CrossEncoderRerankFunction/crossencoderrerankfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "JinaRerankFunction",
        "key": "category:api/python/python/Rerankers/rerankers-jinarerankfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-JinaRerankFunction/Rerankers-JinaRerankFunction",
            "label": "JinaRerankFunction",
            "key": "doc:api/python/python/Rerankers/Rerankers-JinaRerankFunction/rerankers-jinarerankfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-JinaRerankFunction/JinaRerankFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/Rerankers/Rerankers-JinaRerankFunction/jinarerankfunction-call"
          }
        ]
      },
      {
        "type": "category",
        "label": "VoyageRerankFunction",
        "key": "category:api/python/python/Rerankers/rerankers-voyagererankfunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-VoyageRerankFunction/Rerankers-VoyageRerankFunction",
            "label": "VoyageRerankFunction",
            "key": "doc:api/python/python/Rerankers/Rerankers-VoyageRerankFunction/rerankers-voyagererankfunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-VoyageRerankFunction/VoyageRerankFunction-__call__",
            "label": "__call__()",
            "key": "doc:api/python/python/Rerankers/Rerankers-VoyageRerankFunction/voyagererankfunction-call"
          }
        ]
      }
    ]
  }
]
