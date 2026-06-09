module.exports = [
  {
    "type": "category",
    "label": "Deployment",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/deployment/byoc-intro",
        "label": "BYOC Overview"
      },
      {
        "type": "category",
        "label": "Deploy BYOC on AWS",
        "link": {
          "type": "doc",
          "id": "tutorials/deployment/deploy-byoc-aws/deploy-byoc-aws"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/create-bucket-and-role",
            "label": "Create S3 Bucket and IAM Role"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/create-eks-role",
            "label": "Create EKS IAM Role"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/create-cross-account-role",
            "label": "Create Cross-Account IAM Role"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/configure-vpc",
            "label": "Configure a Customer-Managed VPC on AWS"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/permissions-in-roles",
            "label": "Permissions in Roles"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/enable-tiered-storage-aws",
            "label": "Enable Tiered Storage for Exisiting Clusters"
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/deploy-byoc-i-aws",
        "label": "Deploy BYOC-I on AWS"
      },
      {
        "type": "category",
        "label": "Deploy BYOC on GCP",
        "link": {
          "type": "doc",
          "id": "tutorials/deployment/deploy-byoc-gcp/deploy-byoc-gcp"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/create-bucket-and-service-account",
            "label": "Create Cloud Storage Bucket and Service Account"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/create-gke-service-account",
            "label": "Create GKE Service Account"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/create-cross-account-sa",
            "label": "Create a Cross-Account Service Account"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/configure-vpc-gcp",
            "label": "Configure a Customer-Managed VPC on GCP"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/required-permissions-gcp",
            "label": "Required Permissions"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/required-api-services-gcp",
            "label": "Required GCP API Services"
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/deploy-byoc-i-azure",
        "label": "Deploy BYOC-I on Microsoft Azure"
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/prepare-for-cluster-connection",
        "label": "Prepare for Cluster Connection"
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/shared-responsibilities",
        "label": "Shared Responsibilities"
      }
    ]
  },
  {
    "type": "category",
    "label": "Get Started",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/get-started/register-with-zilliz-cloud",
        "label": "Register with Zilliz Cloud"
      },
      {
        "type": "category",
        "label": "Quickstarts",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/get-started/quickstarts/cli-and-agent-integration-guide",
            "label": "Quickstart to CLI & Agent Integration"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/quickstarts/quick-start",
            "label": "Quickstart to Serving Cluster"
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/get-started/cu-types-explained",
        "label": "Cluster Types"
      }
    ]
  },
  {
    "type": "category",
    "label": "Development",
    "items": [
      {
        "type": "category",
        "label": "Search & Query",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/single-vector-search",
            "label": "Basic Vector Search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/tune-recall-rate",
            "label": "Tune Recall Rate"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/filtered-search",
            "label": "Filtered Search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/range-search",
            "label": "Range Search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/grouping-search",
            "label": "Grouping Search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/primary-key-search",
            "label": "Primary-Key Search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/hybrid-search",
            "label": "Hybrid Search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/get-and-scalar-query",
            "label": "Query"
          },
          {
            "type": "category",
            "label": "Filtering",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/filtering-overview",
                "label": "Overview"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/basic-filtering-operators",
                "label": "Basic"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/pattern-match",
                "label": "Pattern Matching"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/filtering-templating",
                "label": "Template"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/json-filtering-operators",
                "label": "JSON"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/array-filtering-operators",
                "label": "Array"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/struct-array-filtering",
                "label": "StructArray"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/ramdom-sampling",
                "label": "Random Sampling"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/geometry-operators",
                "label": "Geometry"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/full-text-search",
            "label": "Full Text Search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/text-match",
            "label": "Text Match"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/text-highlighter",
            "label": "Lexical Highlighter"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/phrase-match",
            "label": "Phrase Match"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/search-with-structarray",
            "label": "Search with StructArray"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/search-with-embeddinglist",
            "label": "Embedding Lists"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/elasticsearch-queries-to-milvus",
            "label": "Elasticsearch Queries to Milvus"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/with-iterators",
            "label": "Search Iterator"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/use-partition-key",
            "label": "Partition Key (Namespace)"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/use-mmap",
            "label": "Use mmap"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/consistency-level",
            "label": "Consistency Level"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/search-metrics-explained",
            "label": "Metric Types"
          }
        ]
      },
      {
        "type": "category",
        "label": "Database",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/database/database",
            "label": "Database"
          }
        ]
      },
      {
        "type": "category",
        "label": "Collection",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-collections",
            "label": "Overview"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-collections-sdks",
            "label": "Create"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/view-collections",
            "label": "View"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/modify-collections",
            "label": "Modify"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/set-collection-ttl",
            "label": "TTL"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/load-release-collections",
            "label": "Load & Release"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-partitions",
            "label": "Partitions"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-aliases",
            "label": "Aliases"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/truncate-collection",
            "label": "Truncate Collection"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/drop-collection",
            "label": "Drop"
          },
          {
            "type": "category",
            "label": "Manage Collection on Console",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/collection/manage-collection-on-console/manage-collections-console",
                "label": "On Console"
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
            "type": "doc",
            "id": "tutorials/development/volume/managed-volume",
            "label": "Managed Volumes"
          }
        ]
      },
      {
        "type": "category",
        "label": "Schema",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/schema/schema-explained",
            "label": "Overview"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/primary-field-auto-id",
            "label": "Primary Field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-dense-vector",
            "label": "Dense Vector"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-binary-vector",
            "label": "Binary Vector"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-sparse-vector",
            "label": "Sparse Vector"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-string-field",
            "label": "VarChar"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-text-field",
            "label": "Text Field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-number-field",
            "label": "Boolean & Number"
          },
          {
            "type": "category",
            "label": "JSON",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/schema/use-json-fields/json-field-overview",
                "label": "Overview"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/use-json-fields/json-indexing",
                "label": "Indexing"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/use-json-fields/json-shredding",
                "label": "Shredding"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-array-fields",
            "label": "Array"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-array-of-structs",
            "label": "Structs"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-geometry-field",
            "label": "Geometry"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-timestamptz-field",
            "label": "TIMSTAMPTZ"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/enable-dynamic-field",
            "label": "Dynamic Field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/nullable-fields",
            "label": "Nullable Fields"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/default-fields",
            "label": "Default Values"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/alter-collection-field",
            "label": "Alter Field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/add-fields-to-an-existing-collection",
            "label": "Add Fields"
          },
          {
            "type": "category",
            "label": "Best Practices",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/schema/schema-best-practices/schema-design-hands-on",
                "label": "Data Model Design"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/schema-best-practices/schema-design-with-structs",
                "label": "Data Model with Structs"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Vector Index",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/vector-index/autoindex-explained",
            "label": "AUTOINDEX"
          },
          {
            "type": "doc",
            "id": "tutorials/development/vector-index/minhash-lsh",
            "label": "MINHASH_LSH"
          },
          {
            "type": "doc",
            "id": "tutorials/development/vector-index/tune-index-build-level",
            "label": "Tune Build Level"
          }
        ]
      },
      {
        "type": "category",
        "label": "Scalar Index",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/bitmap-index-type",
            "label": "BITMAP"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/inverted-index-type",
            "label": "INVERTED"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/ngram-index-type",
            "label": "NGRAM"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/rtree-index-type",
            "label": "RTREE"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/slt-sort-index-type",
            "label": "STL_SORT"
          }
        ]
      },
      {
        "type": "category",
        "label": "Insert & Delete",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/insert-entities",
            "label": "Insert"
          },
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/upsert-entities",
            "label": "Upsert"
          },
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/count-entities",
            "label": "Count"
          },
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/delete-entities",
            "label": "Delete"
          }
        ]
      },
      {
        "type": "category",
        "label": "Data Import",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/data-import/data-import-storage-options",
            "label": "Storage Options"
          },
          {
            "type": "category",
            "label": "Format Options",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/data-import/data-import-format-options/data-import-parquet",
                "label": "Parquet (Recommended)"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/data-import-format-options/data-import-json",
                "label": "JSON/JSON Line"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/data-import-format-options/data-import-numpy",
                "label": "NumPy"
              }
            ]
          },
          {
            "type": "category",
            "label": "Convert Your Data",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/data-import/prepare-data-import/use-bulkwriter",
                "label": "Use BulkWriter"
              }
            ]
          },
          {
            "type": "category",
            "label": "Import Data",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/data-import/import-data/import-data-on-web-ui",
                "label": "Console"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/import-data/import-data-via-restful-api",
                "label": "RESTful API"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/import-data/import-data-via-sdks",
                "label": "SDKs"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/data-import/data-import-zero-to-hero",
            "label": "Zero to Hero"
          }
        ]
      },
      {
        "type": "category",
        "label": "Data Export",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/data-export/export-data-iterators",
            "label": "Using Iterators"
          }
        ]
      },
      {
        "type": "category",
        "label": "Function",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/function/function-and-model-inference-overview",
            "label": "Overview"
          },
          {
            "type": "doc",
            "id": "tutorials/development/function/bm25-function",
            "label": "BM25 Function"
          },
          {
            "type": "doc",
            "id": "tutorials/development/function/minhash-function",
            "label": "MinHash Function"
          },
          {
            "type": "category",
            "label": "Reranking Functions",
            "items": [
              {
                "type": "category",
                "label": "Hybrid Search Rerankers",
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/development/function/reranking-functions/hybrid-search-rerankers/reranking-weighted-reranker",
                    "label": "Weighted Ranker"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/development/function/reranking-functions/hybrid-search-rerankers/reranking-rrf",
                    "label": "RRF Ranker"
                  }
                ]
              },
              {
                "type": "category",
                "label": "Rule-based Rerankers",
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/boost-ranker",
                    "label": "Boost Ranker"
                  },
                  {
                    "type": "category",
                    "label": "Decay Rankers",
                    "items": [
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/decay-ranker-oveview",
                        "label": "Decay Ranker Overview"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/gaussian-decay",
                        "label": "Gaussian Decay"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/exponential-decay",
                        "label": "Exponential Decay"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/linear-decay",
                        "label": "Linear Decay"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/tutorial-implement-time-based-ranking",
                        "label": "Tutorial: Implement Time-based Ranking"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Analyzer",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/analyzer/analyzer-overview",
            "label": "Overview"
          },
          {
            "type": "category",
            "label": "Built-in Analyzer",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/built-in-analyzer/standard-analyzer",
                "label": "Standard"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/built-in-analyzer/english-analyzer",
                "label": "English"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/built-in-analyzer/chinese-analyzer",
                "label": "Chinese"
              }
            ]
          },
          {
            "type": "category",
            "label": "Tokenizer",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/tokenizers/standard-tokenizer",
                "label": "Standard"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/tokenizers/whitespace-tokenizer",
                "label": "Whitespace"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/tokenizers/jieba-tokenizer",
                "label": "Jieba"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/tokenizers/lindera-tokenizer",
                "label": "Lindera"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/tokenizers/icu-tokenizer",
                "label": "ICU"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/tokenizers/language-identifier-tokenizer",
                "label": "Language Identifier"
              }
            ]
          },
          {
            "type": "category",
            "label": "Analyzer Filters",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/lowercase-filter",
                "label": "Lowercase"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/ascii-folding-filter",
                "label": "ASCII folding"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/alphanumonly-filter",
                "label": "Alphanumonly"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/cnalphanumonly-filter",
                "label": "Cnalphanumonly"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/cncharonly-filter",
                "label": "Cncharonly"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/length-filter",
                "label": "Length"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/stop-filter",
                "label": "Stop"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/decompounder-filter",
                "label": "Decompounder"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/stemmer-filter",
                "label": "Stemmer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/remove-punct-filter",
                "label": "Remove Punct"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/regex-filter",
                "label": "Regex"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/synonym-filter",
                "label": "Synonym"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/analyzer/multi-language-analyzers",
            "label": "Multi-language Analyzers"
          },
          {
            "type": "doc",
            "id": "tutorials/development/analyzer/choose-the-right-analyzer-for-your-use-case",
            "label": "Best Practice"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Management",
    "items": [
      {
        "type": "category",
        "label": "Organizations",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/organizations/organization-users",
            "label": "Organization Users"
          },
          {
            "type": "doc",
            "id": "tutorials/management/organizations/organization-settings",
            "label": "Organization Settings"
          },
          {
            "type": "doc",
            "id": "tutorials/management/organizations/use-recycle-bin",
            "label": "Use Recycle Bin"
          }
        ]
      },
      {
        "type": "category",
        "label": "Projects",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/projects/manage-projects",
            "label": "Projects"
          },
          {
            "type": "doc",
            "id": "tutorials/management/projects/project-users",
            "label": "Project Users"
          },
          {
            "type": "doc",
            "id": "tutorials/management/projects/job-center",
            "label": "Project Jobs"
          }
        ]
      },
      {
        "type": "category",
        "label": "Clusters",
        "items": [
          {
            "type": "category",
            "label": "Dedicated Cluster",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/clusters/dedicated-cluster/create-cluster",
                "label": "Create Cluster"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/dedicated-cluster/connect-to-cluster",
                "label": "Connect to Cluster"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/dedicated-cluster/manage-cluster",
                "label": "Manage Cluster"
              },
              {
                "type": "category",
                "label": "Scale Cluster",
                "link": {
                  "type": "doc",
                  "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/scale-cluster"
                },
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/scale-query-cu",
                    "label": "Scale Query CU"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/manage-replica",
                    "label": "Scale Replica"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/cron-expression",
                    "label": "Cron Expression"
                  }
                ]
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
            "type": "ref",
            "id": "tutorials/development/volume/managed-volume",
            "label": "Managed Volumes"
          }
        ]
      },
      {
        "type": "category",
        "label": "Backup & Restore",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/create-backup",
            "label": "Create Backup"
          },
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/schedule-automatic-backups",
            "label": "Schedule Automatic Backups"
          },
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/restore-from-backup-files",
            "label": "Restore from Backup Files"
          },
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/manage-backup-files",
            "label": "Manage Backup Files"
          }
        ]
      },
      {
        "type": "category",
        "label": "Migrations",
        "items": [
          {
            "type": "category",
            "label": "Zilliz to Zilliz Migrations",
            "link": {
              "type": "doc",
              "id": "tutorials/management/migrations/migrate-between-clusters/migrate-between-clusters"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/migrations/migrate-between-clusters/offline-migration",
                "label": "Offline Migration"
              }
            ]
          },
          {
            "type": "category",
            "label": "Migrate from Milvus",
            "link": {
              "type": "doc",
              "id": "tutorials/management/migrations/migrate-from-milvus/migrate-from-milvus"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/migrations/migrate-from-milvus/via-backup-files",
                "label": "Via Backup Files"
              }
            ]
          },
          {
            "type": "category",
            "label": "Migration from External Sources",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/migrations/migration-from-external-sources/zilliz-cloud-ips",
                "label": "Zilliz Cloud IP Addresses"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Metrics & Alerts",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/metrics-and-alerts/metrics-alerts-reference",
            "label": "Metrics Reference"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-and-alerts/view-cluster-metric-charts",
            "label": "View Metric Charts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-and-alerts/manage-organization-alerts",
            "label": "Manage Organization Alerts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-and-alerts/manage-project-alerts",
            "label": "Manage Project Alerts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-and-alerts/manage-notification-channels",
            "label": "Manage Notification Channels"
          },
          {
            "type": "category",
            "label": "Observability Integrations",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/metrics-and-alerts/observability-integrations/prometheus-monitoring",
                "label": "Prometheus"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Access Control",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/access-control/access-control-overview",
            "label": "Access Control Explained"
          },
          {
            "type": "ref",
            "id": "tutorials/management/organizations/organization-users",
            "label": "Organization Users"
          },
          {
            "type": "ref",
            "id": "tutorials/management/projects/project-users",
            "label": "Project Users"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-users",
            "label": "Manage Cluster Users (Console)"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-users-sdk",
            "label": "Manage Cluster User (SDK)"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-roles",
            "label": "Manage Cluster Roles (Console)"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-roles-sdk",
            "label": "Manage Cluster Roles (SDK)"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-privileges",
            "label": "Privileges & Privilege Groups"
          }
        ]
      },
      {
        "type": "category",
        "label": "Authentication",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/authentication/email-accounts",
            "label": "Email Accounts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/authentication/manage-api-keys",
            "label": "API Keys"
          },
          {
            "type": "doc",
            "id": "tutorials/management/authentication/cluster-credentials",
            "label": "Cluster Credentials"
          },
          {
            "type": "doc",
            "id": "tutorials/management/authentication/multi-factor-auth",
            "label": "MFA"
          },
          {
            "type": "category",
            "label": "Single Sign-on (SSO)",
            "link": {
              "type": "doc",
              "id": "tutorials/management/authentication/single-sign-on/single-sign-on"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/openid-connect",
                "label": "Okta (OIDC)"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-okta",
                "label": "Okta (SAML 2.0)"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-google-workspace",
                "label": "Google Workspace (SAML 2.0)"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-microsoft-entra",
                "label": "Microsoft Entra (SAML 2.0)"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-other-idp",
                "label": "Other IdP (SAML 2.0)"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/enforce-sso-in-your-organization",
                "label": "Enforce SSO in Your Organization"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "IP Allowlists",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/ip-allowlists/setup-console-ip-allowlist",
            "label": "Set Up Console IP Allowlist"
          }
        ]
      },
      {
        "type": "category",
        "label": "CMEK",
        "link": {
          "type": "doc",
          "id": "tutorials/management/cmek/cmek"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/cmek/aws-kms",
            "label": "AWS KMS"
          }
        ]
      },
      {
        "type": "category",
        "label": "Audit Logs",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/audit-logs/audit-logs",
            "label": "VectorDB Audit Logs"
          },
          {
            "type": "doc",
            "id": "tutorials/management/audit-logs/audit-logs-ref",
            "label": "VectorDB Audit Logs Reference"
          },
          {
            "type": "doc",
            "id": "tutorials/management/audit-logs/view-activities",
            "label": "View Platform Audit Logs"
          }
        ]
      },
      {
        "type": "category",
        "label": "Access Logs",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/access-logs/access-log-overview",
            "label": "Access Logs Overview"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-logs/configure-access-logs",
            "label": "Configure Access Logs"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-logs/access-log-reference",
            "label": "Access Log Reference"
          }
        ]
      },
      {
        "type": "category",
        "label": "Billing Management",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/billing-management/payment-billing",
            "label": "Payment and Billing Overview"
          },
          {
            "type": "category",
            "label": "Set Up Payment Method",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/billing-management/set-up-payment-method/credits",
                "label": "Credits"
              },
              {
                "type": "doc",
                "id": "tutorials/management/billing-management/set-up-payment-method/advance-pay",
                "label": "Advance Pay"
              },
              {
                "type": "category",
                "label": "Marketplace Subscription",
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-aws-marketplace-private-offer",
                    "label": "AWS Marketplace (Private Offer)"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-gcp-marketplace-private-offer",
                    "label": "Google Cloud Marketplace (Private Offer)"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Zilliz Cloud Limits",
        "link": {
          "type": "doc",
          "id": "tutorials/management/limits/limits"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/limits/api-comparison",
            "label": "API Availability"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Client Libraries",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/client-libraries/install-sdks",
        "label": "Install SDKs"
      },
      {
        "type": "link",
        "href": "/reference/restful",
        "label": "RESTful API"
      },
      {
        "type": "link",
        "href": "/reference/python",
        "label": "Python"
      },
      {
        "type": "link",
        "href": "/reference/java",
        "label": "Java"
      },
      {
        "type": "link",
        "href": "/reference/go",
        "label": "Go"
      },
      {
        "type": "link",
        "href": "/reference/nodejs",
        "label": "Node.js"
      },
      {
        "type": "link",
        "href": "/reference/cpp",
        "label": "C++"
      }
    ]
  },
  {
    "type": "category",
    "label": "Tools",
    "items": [
      {
        "type": "category",
        "label": "Agents & Prompts",
        "link": {
          "type": "doc",
          "id": "tutorials/tools/agents-and-prompts/agents-and-prompts"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/tools/agents-and-prompts/zilliz-skill",
            "label": "Zilliz Skill"
          },
          {
            "type": "category",
            "label": "Claude Code Plugin",
            "link": {
              "type": "doc",
              "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-setup",
                "label": "Setup"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-capabilities",
                "label": "Core Capabilities"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-examples",
                "label": "More Examples"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/tools/agents-and-prompts/zilliz-gemini-extension",
            "label": "Gemini CLI Extension"
          },
          {
            "type": "category",
            "label": "AI Prompts",
            "link": {
              "type": "doc",
              "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-ai-prompts"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-base-prompts",
                "label": "Base Prompt"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-schema-design-prompts",
                "label": "Schema Design"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-search-prompts",
                "label": "Search"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-import-prompts",
                "label": "Import"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-migration-prompts",
                "label": "Migration"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-access-control-prompts",
                "label": "Access Control"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-integrations-prompts",
                "label": "Integrations"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/indexes",
                "label": "Indexes"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/agent-plugins-and-extensions",
                "label": "Agent Plugins and Extensions"
              }
            ]
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/tools/terraform-provider",
        "label": "Terraform Provider"
      },
      {
        "type": "link",
        "href": "/reference/cli/overview",
        "label": "Zilliz CLI"
      }
    ]
  },
  {
    "type": "category",
    "label": "Architecture",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/architecture/data-resilience",
        "label": "Data Resilience"
      },
      {
        "type": "doc",
        "id": "tutorials/architecture/data-security",
        "label": "Data Security"
      },
      {
        "type": "category",
        "label": "Best Practices",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/architecture/best-practices/multi-tenancy",
            "label": "Implement Multi-tenancy"
          },
          {
            "type": "doc",
            "id": "tutorials/architecture/best-practices/environment-isolation",
            "label": "Environment Isolation"
          },
          {
            "type": "doc",
            "id": "tutorials/architecture/best-practices/perf-benchmark-vectordb",
            "label": "Performance Benchmarking with VectorDBBench"
          }
        ]
      }
    ]
  }
]
