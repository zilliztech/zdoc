module.exports = [
  {
    "type": "category",
    "label": "DataImport",
    "items": [
      {
        "type": "doc",
        "id": "api/python/python/DataImport/DataImport-BulkFileType",
        "label": "BulkFileType"
      },
      {
        "type": "category",
        "label": "BulkImport",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-BulkImport/BulkImport-bulk_import",
            "label": "bulk_import()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-BulkImport/BulkImport-get_import_progress",
            "label": "get_import_progress()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-BulkImport/BulkImport-list_import_jobs",
            "label": "list_import_jobs()"
          }
        ]
      },
      {
        "type": "category",
        "label": "LocalBulkWriter",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-LocalBulkWriter/LocalBulkWriter-append_row",
            "label": "append_row()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-LocalBulkWriter/LocalBulkWriter-commit",
            "label": "commit()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-LocalBulkWriter/DataImport-LocalBulkWriter",
            "label": "LocalBulkWriter"
          }
        ]
      },
      {
        "type": "category",
        "label": "RemoteBulkWriter",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-append_row",
            "label": "append_row()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-AzureConnectParam",
            "label": "AzureConnectParam"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-commit",
            "label": "commit()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/DataImport-RemoteBulkWriter",
            "label": "RemoteBulkWriter"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-RemoteBulkWriter/RemoteBulkWriter-S3ConnectParam",
            "label": "S3ConnectParam"
          }
        ]
      },
      {
        "type": "category",
        "label": "VolumeBulkWriter",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-VolumeBulkWriter/VolumeBulkWriter-append_row",
            "label": "append_row()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-VolumeBulkWriter/VolumeBulkWriter-commit",
            "label": "commit()"
          },
          {
            "type": "doc",
            "id": "api/python/python/DataImport/DataImport-VolumeBulkWriter/DataImport-VolumeBulkWriter",
            "label": "VolumeBulkWriter"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "FileResource",
    "items": [
      {
        "type": "doc",
        "id": "api/python/python/FileResource/FileResource-add_file_resource",
        "label": "add_file_resource()"
      },
      {
        "type": "doc",
        "id": "api/python/python/FileResource/FileResource-list_file_resources",
        "label": "list_file_resources()"
      },
      {
        "type": "doc",
        "id": "api/python/python/FileResource/FileResource-remove_file_resource",
        "label": "remove_file_resource()"
      }
    ]
  },
  {
    "type": "category",
    "label": "MilvusClient",
    "items": [
      {
        "type": "category",
        "label": "Authentication",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-create_role",
            "label": "create_role()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-create_user",
            "label": "create_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-describe_role",
            "label": "describe_role()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-describe_user",
            "label": "describe_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-drop_role",
            "label": "drop_role()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-drop_user",
            "label": "drop_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-grant_privilege_v2",
            "label": "grant_privilege_v2()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-grant_role",
            "label": "grant_role()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-list_privilege_groups",
            "label": "list_privilege_groups()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-list_roles",
            "label": "list_roles()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-list_users",
            "label": "list_users()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-revoke_privilege_v2",
            "label": "revoke_privilege_v2()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-revoke_role",
            "label": "revoke_role()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-update_password",
            "label": "update_password()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Client",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Client/Client-close",
            "label": "close()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Client/Client-MilvusClient",
            "label": "MilvusClient"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Client/Client-AsyncMilvusClient",
            "label": "AsyncMilvusClient"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Client/Client-session",
            "label": "session()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Collections",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-alter_alias",
            "label": "alter_alias()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-alter_collection_field",
            "label": "alter_collection_field()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-alter_collection_properties",
            "label": "alter_collection_properties()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_alias",
            "label": "create_alias()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_collection",
            "label": "create_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_schema",
            "label": "create_schema()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-DataType",
            "label": "DataType"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-describe_alias",
            "label": "describe_alias()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-describe_collection",
            "label": "describe_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_alias",
            "label": "drop_alias()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_collection",
            "label": "drop_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_collection_properties",
            "label": "drop_collection_properties()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-get_collection_stats",
            "label": "get_collection_stats()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-has_collection",
            "label": "has_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-IndexType",
            "label": "IndexType"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-list_aliases",
            "label": "list_aliases()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-list_collections",
            "label": "list_collections()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-rename_collection",
            "label": "rename_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-FunctionType",
            "label": "FunctionType"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-add_collection_field",
            "label": "add_collection_field()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-add_collection_function",
            "label": "add_collection_function()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-alter_collection_function",
            "label": "alter_collection_function()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_collection_function",
            "label": "drop_collection_function()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-drop_collection_field",
            "label": "drop_collection_field()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-get_refresh_external_collection_progress",
            "label": "get_refresh_external_collection_progress()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-list_refresh_external_collection_jobs",
            "label": "list_refresh_external_collection_jobs()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Collections/Collections-refresh_external_collection",
            "label": "refresh_external_collection()"
          }
        ]
      },
      {
        "type": "category",
        "label": "CollectionSchema",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/CollectionSchema-add_field",
            "label": "add_field()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/MilvusClient-CollectionSchema",
            "label": "CollectionSchema"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/CollectionSchema-construct_from_dict",
            "label": "construct_from_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/CollectionSchema-to_dict",
            "label": "to_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/CollectionSchema-verify",
            "label": "verify()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-CollectionSchema/CollectionSchema-run_analyzer",
            "label": "run_analyzer()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Management",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-add_index",
            "label": "add_index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-compact",
            "label": "compact()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-create_index",
            "label": "create_index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-describe_index",
            "label": "describe_index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-drop_index",
            "label": "drop_index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-flush",
            "label": "flush()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-get_compact_state",
            "label": "get_compact_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-get_load_state",
            "label": "get_load_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-list_indexes",
            "label": "list_indexes()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-load_collection",
            "label": "load_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-prepare_index_params",
            "label": "prepare_index_params()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-refresh_load",
            "label": "refresh_load()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-release_collection",
            "label": "release_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-alter_index_properties",
            "label": "alter_index_properties()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-drop_index_properties",
            "label": "drop_index_properties()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-flush_all",
            "label": "flush_all()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-get_compaction_plans",
            "label": "get_compaction_plans()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-get_compaction_state",
            "label": "get_compaction_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-get_flush_all_state",
            "label": "get_flush_all_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-list_loaded_segments",
            "label": "list_loaded_segments()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-list_persistent_segments",
            "label": "list_persistent_segments()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Management/Management-optimize",
            "label": "optimize()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Partitions",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-create_partition",
            "label": "create_partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-drop_partition",
            "label": "drop_partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-get_partition_stats",
            "label": "get_partition_stats()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-has_partition",
            "label": "has_partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-list_partitions",
            "label": "list_partitions()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-load_partitions",
            "label": "load_partitions()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Partitions/Partitions-release_partitions",
            "label": "release_partitions()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Vector",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-delete",
            "label": "delete()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-get",
            "label": "get()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-insert",
            "label": "insert()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-query",
            "label": "query()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-query_iterator",
            "label": "query_iterator()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-search",
            "label": "search()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-search_iterator",
            "label": "search_iterator()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-upsert",
            "label": "upsert()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-hybrid_search",
            "label": "hybrid_search()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-GroupBy",
            "label": "GroupBy"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Vector/Vector-TopHits",
            "label": "TopHits"
          }
        ]
      },
      {
        "type": "category",
        "label": "Database",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-alter_database_properties",
            "label": "alter_database_properties()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-create_database",
            "label": "create_database()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-describe_database",
            "label": "describe_database()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-drop_database",
            "label": "drop_database()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-drop_database_properties",
            "label": "drop_database_properties()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-list_databases",
            "label": "list_databases()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-using_database",
            "label": "using_database()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Database/Database-use_database",
            "label": "use_database()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Function",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-add_function",
            "label": "add_function()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-construct_from_dict",
            "label": "construct_from_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/MilvusClient-Function",
            "label": "Function"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-to_dict",
            "label": "to_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Function/Function-verify",
            "label": "verify()"
          }
        ]
      },
      {
        "type": "category",
        "label": "EmbeddingList",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-add",
            "label": "add()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-add_batch",
            "label": "add_batch()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-clear",
            "label": "clear()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/MilvusClient-EmbeddingList",
            "label": "EmbeddingList"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-to_flat_array",
            "label": "to_flat_array()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-EmbeddingList/EmbeddingList-to_numpy",
            "label": "to_numpy()"
          }
        ]
      },
      {
        "type": "doc",
        "id": "api/python/python/MilvusClient/MilvusClient-FunctionScore",
        "label": "FunctionScore"
      },
      {
        "type": "category",
        "label": "Highlighter",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Highlighter/Highlighter-LexicalHighlighter",
            "label": "LexicalHighlighter"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Highlighter/Highlighter-SemanticHighlighter",
            "label": "SemanticHighlighter"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Highlighter/Highlighter-with_query",
            "label": "with_query()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Snapshot",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-create_snapshot",
            "label": "create_snapshot()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-describe_snapshot",
            "label": "describe_snapshot()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-drop_snapshot",
            "label": "drop_snapshot()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-get_restore_snapshot_state",
            "label": "get_restore_snapshot_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-list_restore_snapshot_jobs",
            "label": "list_restore_snapshot_jobs()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-list_snapshots",
            "label": "list_snapshots()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-pin_snapshot_data",
            "label": "pin_snapshot_data()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-restore_snapshot",
            "label": "restore_snapshot()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-Snapshot/Snapshot-unpin_snapshot_data",
            "label": "unpin_snapshot_data()"
          }
        ]
      },
      {
        "type": "category",
        "label": "StructFieldSchema",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-StructFieldSchema/StructFieldSchema-add_field",
            "label": "add_field()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-StructFieldSchema/StructFieldSchema-construct_from_dict",
            "label": "construct_from_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-StructFieldSchema/MilvusClient-StructFieldSchema",
            "label": "StructFieldSchema"
          },
          {
            "type": "doc",
            "id": "api/python/python/MilvusClient/MilvusClient-StructFieldSchema/StructFieldSchema-to_dict",
            "label": "to_dict()"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "EmbeddingModels",
    "items": [
      {
        "type": "category",
        "label": "BGEM3EmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/EmbeddingModels-BGEM3EmbeddingFunction",
            "label": "BGEM3EmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/BGEM3EmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/BGEM3EmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-BGEM3EmbeddingFunction/BGEM3EmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "CohereEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/EmbeddingModels-CohereEmbeddingFunction",
            "label": "CohereEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/CohereEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/CohereEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-CohereEmbeddingFunction/CohereEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "InstructorEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/InstructorEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/InstructorEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/EmbeddingModels-InstructorEmbeddingFunction",
            "label": "InstructorEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-InstructorEmbeddingFunction/InstructorEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "JinaEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/JinaEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/JinaEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/EmbeddingModels-JinaEmbeddingFunction",
            "label": "JinaEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-JinaEmbeddingFunction/JinaEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "MGTEEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/MGTEEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/MGTEEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/EmbeddingModels-MGTEEmbeddingFunction",
            "label": "MGTEEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MGTEEmbeddingFunction/MGTEEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "MistralAIEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/MistralAIEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/MistralAIEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/EmbeddingModels-MistralAIEmbeddingFunction",
            "label": "MistralAIEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-MistralAIEmbeddingFunction/MistralAIEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "NomicEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/NomicEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/NomicEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/EmbeddingModels-NomicEmbeddingFunction",
            "label": "NomicEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-NomicEmbeddingFunction/NomicEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "OnnxEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/OnnxEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/OnnxEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/EmbeddingModels-OnnxEmbeddingFunction",
            "label": "OnnxEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OnnxEmbeddingFunction/OnnxEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "OpenAIEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/OpenAIEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/OpenAIEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/EmbeddingModels-OpenAIEmbeddingFunction",
            "label": "OpenAIEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-OpenAIEmbeddingFunction/OpenAIEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "SentenceTransformerEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/SentenceTransformerEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/SentenceTransformerEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/EmbeddingModels-SentenceTransformerEmbeddingFunction",
            "label": "SentenceTransformerEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SentenceTransformerEmbeddingFunction/SentenceTransformerEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "SpladeEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/SpladeEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/SpladeEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/EmbeddingModels-SpladeEmbeddingFunction",
            "label": "SpladeEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-SpladeEmbeddingFunction/SpladeEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "VoyageEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/VoyageEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/VoyageEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/EmbeddingModels-VoyageEmbeddingFunction",
            "label": "VoyageEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-VoyageEmbeddingFunction/VoyageEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "GeminiEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/GeminiEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/GeminiEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/EmbeddingModels-GeminiEmbeddingFunction",
            "label": "GeminiEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-GeminiEmbeddingFunction/GeminiEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Model2VecEmbeddingFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/Model2VecEmbeddingFunction-encode_documents",
            "label": "encode_documents()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/Model2VecEmbeddingFunction-encode_queries",
            "label": "encode_queries()"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/EmbeddingModels-Model2VecEmbeddingFunction",
            "label": "Model2VecEmbeddingFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/EmbeddingModels/EmbeddingModels-Model2VecEmbeddingFunction/Model2VecEmbeddingFunction-__call__",
            "label": "__call__()"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "ORM",
    "items": [
      {
        "type": "category",
        "label": "Collection",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/ORM-Collection",
            "label": "Collection"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-compact",
            "label": "compact()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-construct_from_dataframe",
            "label": "construct_from_dataframe()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-create_index",
            "label": "create_index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-create_partition",
            "label": "create_partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-delete",
            "label": "delete()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-describe",
            "label": "describe()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-drop",
            "label": "drop()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-drop_index",
            "label": "drop_index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-drop_partition",
            "label": "drop_partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-flush",
            "label": "flush()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-get_compaction_plans",
            "label": "get_compaction_plans()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-get_compaction_state",
            "label": "get_compaction_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-get_replicas",
            "label": "get_replicas()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-has_index",
            "label": "has_index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-has_partition",
            "label": "has_partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-hybrid_search",
            "label": "hybrid_search()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-index",
            "label": "index()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-insert",
            "label": "insert()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-load",
            "label": "load()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-partition",
            "label": "partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-query",
            "label": "query()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-query_iterator",
            "label": "query_iterator()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-release",
            "label": "release()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-search",
            "label": "search()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-search_iterator",
            "label": "search_iterator()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-set_properties",
            "label": "set_properties()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-upsert",
            "label": "upsert()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Collection/Collection-wait_for_compaction_completed",
            "label": "wait_for_compaction_completed()"
          }
        ]
      },
      {
        "type": "category",
        "label": "CollectionSchema",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-CollectionSchema/ORM-CollectionSchema",
            "label": "CollectionSchema"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-CollectionSchema/CollectionSchema-construct_from_dict_1",
            "label": "construct_from_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-CollectionSchema/CollectionSchema-to_dict_1",
            "label": "to_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-CollectionSchema/CollectionSchema-verify_1",
            "label": "verify()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Connections",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-add_connection",
            "label": "add_connection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-connect",
            "label": "connect()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/ORM-Connections",
            "label": "Connections"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-disconnect",
            "label": "disconnect()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-get_connection_addr",
            "label": "get_connection_addr()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-has_connection",
            "label": "has_connection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-list_connections",
            "label": "list_connections()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Connections/Connections-remove_connection",
            "label": "remove_connection()"
          }
        ]
      },
      {
        "type": "category",
        "label": "db",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-create_database",
            "label": "create_database()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-drop_database",
            "label": "drop_database()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-list_database",
            "label": "list_database()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-db/db-using_database",
            "label": "using_database()"
          }
        ]
      },
      {
        "type": "category",
        "label": "FieldSchema",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-FieldSchema/FieldSchema-construct_from_dict",
            "label": "construct_from_dict()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-FieldSchema/ORM-FieldSchema",
            "label": "FieldSchema"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-FieldSchema/FieldSchema-to_dict",
            "label": "to_dict()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Partition",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-delete",
            "label": "delete()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-drop",
            "label": "drop()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-flush",
            "label": "flush()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-get_replicas",
            "label": "get_replicas()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-insert",
            "label": "insert()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-load",
            "label": "load()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/ORM-Partition",
            "label": "Partition"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-query",
            "label": "query()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-release",
            "label": "release()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-search",
            "label": "search()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Partition/Partition-upsert",
            "label": "upsert()"
          }
        ]
      },
      {
        "type": "category",
        "label": "Role",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-add_user",
            "label": "add_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-create",
            "label": "create()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-drop",
            "label": "drop()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-get_users",
            "label": "get_users()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-grant",
            "label": "grant()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-is_exist",
            "label": "is_exist()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-list_grant",
            "label": "list_grant()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-list_grants",
            "label": "list_grants()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-remove_user",
            "label": "remove_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/Role-revoke",
            "label": "revoke()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-Role/ORM-Role",
            "label": "Role"
          }
        ]
      },
      {
        "type": "category",
        "label": "utility",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-alter_alias",
            "label": "alter_alias()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-BulkInsertState",
            "label": "BulkInsertState"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-create_alias",
            "label": "create_alias()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-create_resource_group",
            "label": "create_resource_group()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-create_user",
            "label": "create_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-delete_user",
            "label": "delete_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-describe_resource_group",
            "label": "describe_resource_group()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-do_bulk_insert",
            "label": "do_bulk_insert()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-drop_alias",
            "label": "drop_alias()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-drop_collection",
            "label": "drop_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-drop_resource_group",
            "label": "drop_resource_group()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-flush_all",
            "label": "flush_all()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_bulk_insert_state",
            "label": "get_bulk_insert_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_query_segment_info",
            "label": "get_query_segment_info()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_server_type",
            "label": "get_server_type()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-get_server_version",
            "label": "get_server_version()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-has_collection",
            "label": "has_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-has_partition",
            "label": "has_partition()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-hybridts_to_datetime",
            "label": "hybridts_to_datetime()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-hybridts_to_unixtime",
            "label": "hybridts_to_unixtime()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-index_building_progress",
            "label": "index_building_progress()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_aliases",
            "label": "list_aliases()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_bulk_insert_tasks",
            "label": "list_bulk_insert_tasks()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_collections",
            "label": "list_collections()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_indexes",
            "label": "list_indexes()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_resource_groups",
            "label": "list_resource_groups()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_roles",
            "label": "list_roles()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_user",
            "label": "list_user()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_usernames",
            "label": "list_usernames()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-list_users",
            "label": "list_users()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-loading_progress",
            "label": "loading_progress()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-load_balance",
            "label": "load_balance()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-load_state",
            "label": "load_state()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-mkts_from_datetime",
            "label": "mkts_from_datetime()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-mkts_from_hybridts",
            "label": "mkts_from_hybridts()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-mkts_from_unixtime",
            "label": "mkts_from_unixtime()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-rename_collection",
            "label": "rename_collection()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-reset_password",
            "label": "reset_password()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-transfer_node",
            "label": "transfer_node()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-transfer_replica",
            "label": "transfer_replica()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-update_password",
            "label": "update_password()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-wait_for_index_building_complete",
            "label": "wait_for_index_building_complete()"
          },
          {
            "type": "doc",
            "id": "api/python/python/ORM/ORM-utility/utility-wait_for_loading_complete",
            "label": "wait_for_loading_complete()"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Rerankers",
    "items": [
      {
        "type": "category",
        "label": "BGERerankFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-BGERerankFunction/Rerankers-BGERerankFunction",
            "label": "BGERerankFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-BGERerankFunction/BGERerankFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "CohereRerankFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CohereRerankFunction/Rerankers-CohereRerankFunction",
            "label": "CohereRerankFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CohereRerankFunction/CohereRerankFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "CrossEncoderRerankFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CrossEncoderRerankFunction/Rerankers-CrossEncoderRerankFunction",
            "label": "CrossEncoderRerankFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-CrossEncoderRerankFunction/CrossEncoderRerankFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "JinaRerankFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-JinaRerankFunction/Rerankers-JinaRerankFunction",
            "label": "JinaRerankFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-JinaRerankFunction/JinaRerankFunction-__call__",
            "label": "__call__()"
          }
        ]
      },
      {
        "type": "category",
        "label": "VoyageRerankFunction",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-VoyageRerankFunction/Rerankers-VoyageRerankFunction",
            "label": "VoyageRerankFunction"
          },
          {
            "type": "doc",
            "id": "api/python/python/Rerankers/Rerankers-VoyageRerankFunction/VoyageRerankFunction-__call__",
            "label": "__call__()"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Volume",
    "items": [
      {
        "type": "category",
        "label": "VolumeFileManager",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeFileManager/VolumeFileManager-upload_file_to_volume",
            "label": "upload_file_to_volume()"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeFileManager/Volume-VolumeFileManager",
            "label": "VolumeFileManager"
          }
        ]
      },
      {
        "type": "category",
        "label": "VolumeManager",
        "items": [
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/VolumeManager-create_volume",
            "label": "create_volume()"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/VolumeManager-delete_volume",
            "label": "delete_volume()"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/VolumeManager-describe_volume",
            "label": "describe_volume()"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/VolumeManager-list_volumes",
            "label": "list_volumes()"
          },
          {
            "type": "doc",
            "id": "api/python/python/Volume/Volume-VolumeManager/Volume-VolumeManager",
            "label": "VolumeManager"
          }
        ]
      }
    ]
  }
]
