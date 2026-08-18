module.exports = [
  {
    "type": "category",
    "label": "Deployment",
    "key": "category:tutorials/deployment",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/deployment/byoc-intro",
        "label": "BYOC Overview",
        "key": "doc:tutorials/deployment/byoc-intro"
      },
      {
        "type": "category",
        "label": "Deploy BYOC on AWS",
        "key": "category:tutorials/deployment/deploy-byoc-aws",
        "link": {
          "type": "doc",
          "id": "tutorials/deployment/deploy-byoc-aws/deploy-byoc-aws"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/create-bucket-and-role",
            "label": "Create S3 Bucket and IAM Role",
            "key": "doc:tutorials/deployment/deploy-byoc-aws/create-bucket-and-role"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/create-eks-role",
            "label": "Create EKS IAM Role",
            "key": "doc:tutorials/deployment/deploy-byoc-aws/create-eks-role"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/create-cross-account-role",
            "label": "Create Cross-Account IAM Role",
            "key": "doc:tutorials/deployment/deploy-byoc-aws/create-cross-account-role"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/configure-vpc",
            "label": "Configure a Customer-Managed VPC on AWS",
            "key": "doc:tutorials/deployment/deploy-byoc-aws/configure-vpc"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/permissions-in-roles",
            "label": "Permissions in Roles",
            "key": "doc:tutorials/deployment/deploy-byoc-aws/permissions-in-roles"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-aws/enable-tiered-storage-aws",
            "label": "Enable Tiered Storage for Exisiting Clusters",
            "key": "doc:tutorials/deployment/deploy-byoc-aws/enable-tiered-storage-aws"
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/deploy-byoc-i-aws",
        "label": "Deploy BYOC-I on AWS",
        "key": "doc:tutorials/deployment/deploy-byoc-i-aws"
      },
      {
        "type": "category",
        "label": "Deploy BYOC on GCP",
        "key": "category:tutorials/deployment/deploy-byoc-gcp",
        "link": {
          "type": "doc",
          "id": "tutorials/deployment/deploy-byoc-gcp/deploy-byoc-gcp"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/create-bucket-and-service-account",
            "label": "Create Cloud Storage Bucket and Service Account",
            "key": "doc:tutorials/deployment/deploy-byoc-gcp/create-bucket-and-service-account"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/create-gke-service-account",
            "label": "Create GKE Service Account",
            "key": "doc:tutorials/deployment/deploy-byoc-gcp/create-gke-service-account"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/create-cross-account-sa",
            "label": "Create a Cross-Account Service Account",
            "key": "doc:tutorials/deployment/deploy-byoc-gcp/create-cross-account-sa"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/configure-vpc-gcp",
            "label": "Configure a Customer-Managed VPC on GCP",
            "key": "doc:tutorials/deployment/deploy-byoc-gcp/configure-vpc-gcp"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/required-permissions-gcp",
            "label": "Required Permissions",
            "key": "doc:tutorials/deployment/deploy-byoc-gcp/required-permissions-gcp"
          },
          {
            "type": "doc",
            "id": "tutorials/deployment/deploy-byoc-gcp/required-api-services-gcp",
            "label": "Required GCP API Services",
            "key": "doc:tutorials/deployment/deploy-byoc-gcp/required-api-services-gcp"
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/deploy-byoc-i-gcp",
        "label": "Deploy BYOC-I on GCP",
        "key": "doc:tutorials/deployment/deploy-byoc-i-gcp"
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/deploy-byoc-i-azure",
        "label": "Deploy BYOC-I on Microsoft Azure",
        "key": "doc:tutorials/deployment/deploy-byoc-i-azure"
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/prepare-for-cluster-connection",
        "label": "Prepare for Cluster Connection",
        "key": "doc:tutorials/deployment/prepare-for-cluster-connection"
      },
      {
        "type": "doc",
        "id": "tutorials/deployment/shared-responsibilities",
        "label": "Shared Responsibilities",
        "key": "doc:tutorials/deployment/shared-responsibilities"
      }
    ]
  },
  {
    "type": "category",
    "label": "Get Started",
    "key": "category:tutorials/get-started",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/get-started/register-with-zilliz-cloud",
        "label": "Register with Zilliz Cloud",
        "key": "doc:tutorials/get-started/register-with-zilliz-cloud"
      },
      {
        "type": "category",
        "label": "Quickstarts",
        "key": "category:tutorials/get-started/quickstarts",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/get-started/quickstarts/cli-and-agent-integration-guide",
            "label": "Quickstart to CLI & Agent Integration",
            "key": "doc:tutorials/get-started/quickstarts/cli-and-agent-integration-guide"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/quickstarts/quick-start",
            "label": "Quickstart to Serving Cluster",
            "key": "doc:tutorials/get-started/quickstarts/quick-start"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/quickstarts/quick-start-to-on-demand-search",
            "label": "Quickstart to On-Demand Search",
            "key": "doc:tutorials/get-started/quickstarts/quick-start-to-on-demand-search"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/quickstarts/quick-start-to-external-data-lake-search",
            "label": "Quickstart to External Data Lake Search",
            "key": "doc:tutorials/get-started/quickstarts/quick-start-to-external-data-lake-search"
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/get-started/cu-types-explained",
        "label": "Cluster Types",
        "key": "doc:tutorials/get-started/cu-types-explained"
      },
      {
        "type": "category",
        "label": "FAQs",
        "key": "category:tutorials/get-started/faqs",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-get-started",
            "label": "FAQ: Get Started",
            "key": "doc:tutorials/get-started/faqs/faq-get-started"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-cluster",
            "label": "FAQ: Cluster",
            "key": "doc:tutorials/get-started/faqs/faq-cluster"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-collection",
            "label": "FAQ: Collection",
            "key": "doc:tutorials/get-started/faqs/faq-collection"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-data-import",
            "label": "FAQ: Data Import",
            "key": "doc:tutorials/get-started/faqs/faq-data-import"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-migration",
            "label": "FAQ: Migration",
            "key": "doc:tutorials/get-started/faqs/faq-migration"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-resource-planning",
            "label": "FAQ: Resource Planning",
            "key": "doc:tutorials/get-started/faqs/faq-resource-planning"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-backup-and-restore",
            "label": "FAQ: Backup and Restore",
            "key": "doc:tutorials/get-started/faqs/faq-backup-and-restore"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-users-and-roles",
            "label": "FAQ: Users & Roles",
            "key": "doc:tutorials/get-started/faqs/faq-users-and-roles"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-monitors-and-metrics",
            "label": "FAQ: Monitors & Metrics",
            "key": "doc:tutorials/get-started/faqs/faq-monitors-and-metrics"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-authentication",
            "label": "FAQ: Authentication",
            "key": "doc:tutorials/get-started/faqs/faq-authentication"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-integrations",
            "label": "FAQ: Integrations",
            "key": "doc:tutorials/get-started/faqs/faq-integrations"
          },
          {
            "type": "doc",
            "id": "tutorials/get-started/faqs/faq-security",
            "label": "FAQ: Security",
            "key": "doc:tutorials/get-started/faqs/faq-security"
          }
        ]
      },
      {
        "type": "category",
        "label": "Release notes",
        "key": "category:tutorials/get-started/release-notes",
        "items": []
      }
    ]
  },
  {
    "type": "category",
    "label": "Development",
    "key": "category:tutorials/development",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/development/connect-to-serving-cluster",
        "label": "Connect to Serving Clusters",
        "key": "doc:tutorials/development/connect-to-serving-cluster"
      },
      {
        "type": "doc",
        "id": "tutorials/development/connect-for-on-demand-search",
        "label": "Connect for On-Demand Search",
        "key": "doc:tutorials/development/connect-for-on-demand-search"
      },
      {
        "type": "category",
        "label": "Search & Query",
        "key": "category:tutorials/development/search-and-query",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/single-vector-search",
            "label": "Basic Vector Search",
            "key": "doc:tutorials/development/search-and-query/single-vector-search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/dql-sessions-external-collection",
            "label": "DQL sessions",
            "key": "doc:tutorials/development/search-and-query/dql-sessions-external-collection"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/tune-recall-rate",
            "label": "Tune Recall Rate",
            "key": "doc:tutorials/development/search-and-query/tune-recall-rate"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/filtered-search",
            "label": "Filtered Search",
            "key": "doc:tutorials/development/search-and-query/filtered-search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/range-search",
            "label": "Range Search",
            "key": "doc:tutorials/development/search-and-query/range-search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/grouping-search",
            "label": "Grouping Search",
            "key": "doc:tutorials/development/search-and-query/grouping-search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/search-aggregation",
            "label": "Search Aggregation",
            "key": "doc:tutorials/development/search-and-query/search-aggregation"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/primary-key-search",
            "label": "Primary-Key Search",
            "key": "doc:tutorials/development/search-and-query/primary-key-search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/hybrid-search",
            "label": "Hybrid Search",
            "key": "doc:tutorials/development/search-and-query/hybrid-search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/get-and-scalar-query",
            "label": "Query",
            "key": "doc:tutorials/development/search-and-query/get-and-scalar-query"
          },
          {
            "type": "category",
            "label": "Filtering",
            "key": "category:tutorials/development/search-and-query/filtering",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/filtering-overview",
                "label": "Overview",
                "key": "doc:tutorials/development/search-and-query/filtering/filtering-overview"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/basic-filtering-operators",
                "label": "Basic",
                "key": "doc:tutorials/development/search-and-query/filtering/basic-filtering-operators"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/pattern-match",
                "label": "Pattern Matching",
                "key": "doc:tutorials/development/search-and-query/filtering/pattern-match"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/filtering-templating",
                "label": "Template",
                "key": "doc:tutorials/development/search-and-query/filtering/filtering-templating"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/json-filtering-operators",
                "label": "JSON",
                "key": "doc:tutorials/development/search-and-query/filtering/json-filtering-operators"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/array-filtering-operators",
                "label": "Array",
                "key": "doc:tutorials/development/search-and-query/filtering/array-filtering-operators"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/struct-array-filtering",
                "label": "StructArray",
                "key": "doc:tutorials/development/search-and-query/filtering/struct-array-filtering"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/ramdom-sampling",
                "label": "Random Sampling",
                "key": "doc:tutorials/development/search-and-query/filtering/ramdom-sampling"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/filtering/geometry-operators",
                "label": "Geometry",
                "key": "doc:tutorials/development/search-and-query/filtering/geometry-operators"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/full-text-search",
            "label": "Full Text Search",
            "key": "doc:tutorials/development/search-and-query/full-text-search"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/text-match",
            "label": "Text Match",
            "key": "doc:tutorials/development/search-and-query/text-match"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/text-highlighter",
            "label": "Lexical Highlighter",
            "key": "doc:tutorials/development/search-and-query/text-highlighter"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/phrase-match",
            "label": "Phrase Match",
            "key": "doc:tutorials/development/search-and-query/phrase-match"
          },
          {
            "type": "category",
            "label": "Search with StructArray",
            "key": "category:tutorials/development/search-and-query/struct-array-search",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/struct-array-search/search-with-struct-array",
                "label": "Basic Vector Search",
                "key": "doc:tutorials/development/search-and-query/struct-array-search/search-with-struct-array"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/struct-array-search/filtered-search-with-struct-arrays",
                "label": "Filtered Search",
                "key": "doc:tutorials/development/search-and-query/struct-array-search/filtered-search-with-struct-arrays"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/struct-array-search/range-search-with-struct-arrays",
                "label": "Range Search",
                "key": "doc:tutorials/development/search-and-query/struct-array-search/range-search-with-struct-arrays"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/struct-array-search/grouping-search-with-struct-array",
                "label": "Grouping Search",
                "key": "doc:tutorials/development/search-and-query/struct-array-search/grouping-search-with-struct-array"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/struct-array-search/hybrid-search-with-struct-array",
                "label": "Hybrid Search",
                "key": "doc:tutorials/development/search-and-query/struct-array-search/hybrid-search-with-struct-array"
              },
              {
                "type": "doc",
                "id": "tutorials/development/search-and-query/struct-array-search/tutorial-colbert-colpali",
                "label": "ColBERT and ColPali",
                "key": "doc:tutorials/development/search-and-query/struct-array-search/tutorial-colbert-colpali"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/elasticsearch-queries-to-milvus",
            "label": "Elasticsearch Queries to Milvus",
            "key": "doc:tutorials/development/search-and-query/elasticsearch-queries-to-milvus"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/with-iterators",
            "label": "Search Iterator",
            "key": "doc:tutorials/development/search-and-query/with-iterators"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/use-partition-key",
            "label": "Partition Key (Namespace)",
            "key": "doc:tutorials/development/search-and-query/use-partition-key"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/use-mmap",
            "label": "Use mmap",
            "key": "doc:tutorials/development/search-and-query/use-mmap"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/consistency-level",
            "label": "Consistency Level",
            "key": "doc:tutorials/development/search-and-query/consistency-level"
          },
          {
            "type": "doc",
            "id": "tutorials/development/search-and-query/search-metrics-explained",
            "label": "Metric Types",
            "key": "doc:tutorials/development/search-and-query/search-metrics-explained"
          }
        ]
      },
      {
        "type": "category",
        "label": "Database",
        "key": "category:tutorials/development/database",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/database/database-concept",
            "label": "Database Explained",
            "key": "doc:tutorials/development/database/database-concept"
          },
          {
            "type": "doc",
            "id": "tutorials/development/database/database",
            "label": "Database in Serving Clusters",
            "key": "doc:tutorials/development/database/database"
          },
          {
            "type": "doc",
            "id": "tutorials/development/database/on-demand-database",
            "label": "Database for On-Demand Search",
            "key": "doc:tutorials/development/database/on-demand-database"
          }
        ]
      },
      {
        "type": "category",
        "label": "Collection",
        "key": "category:tutorials/development/collection",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-collections",
            "label": "Overview",
            "key": "doc:tutorials/development/collection/manage-collections"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-collections-sdks",
            "label": "Managed Collection",
            "key": "doc:tutorials/development/collection/manage-collections-sdks"
          },
          {
            "type": "category",
            "label": "External Collection",
            "key": "category:tutorials/development/collection/create-external-collection",
            "link": {
              "type": "doc",
              "id": "tutorials/development/collection/create-external-collection/create-external-collection"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/collection/create-external-collection/use-milvus-snapshot-as-data-source",
                "label": "Snapshot as Source",
                "key": "doc:tutorials/development/collection/create-external-collection/use-milvus-snapshot-as-data-source"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/view-collections",
            "label": "View",
            "key": "doc:tutorials/development/collection/view-collections"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/modify-collections",
            "label": "Modify",
            "key": "doc:tutorials/development/collection/modify-collections"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/set-collection-ttl",
            "label": "TTL",
            "key": "doc:tutorials/development/collection/set-collection-ttl"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/load-release-collections",
            "label": "Load & Release",
            "key": "doc:tutorials/development/collection/load-release-collections"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-partitions",
            "label": "Partitions",
            "key": "doc:tutorials/development/collection/manage-partitions"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/manage-aliases",
            "label": "Aliases",
            "key": "doc:tutorials/development/collection/manage-aliases"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/truncate-collection",
            "label": "Truncate Collection",
            "key": "doc:tutorials/development/collection/truncate-collection"
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/drop-collection",
            "label": "Drop",
            "key": "doc:tutorials/development/collection/drop-collection"
          },
          {
            "type": "category",
            "label": "Collection on Console",
            "key": "category:tutorials/development/collection/collection-on-console",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/collection/collection-on-console/manage-collections-console",
                "label": "Manage Collections (Console)",
                "key": "doc:tutorials/development/collection/collection-on-console/manage-collections-console"
              },
              {
                "type": "doc",
                "id": "tutorials/development/collection/collection-on-console/manage-external-collections-console",
                "label": "Manage External Collections (Console)",
                "key": "doc:tutorials/development/collection/collection-on-console/manage-external-collections-console"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/collection/external-collection-limits",
            "label": "External Collection Limits",
            "key": "doc:tutorials/development/collection/external-collection-limits"
          }
        ]
      },
      {
        "type": "category",
        "label": "Volume",
        "key": "category:tutorials/development/volume",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/volume/external-volume",
            "label": "External Volumes",
            "key": "doc:tutorials/development/volume/external-volume"
          },
          {
            "type": "category",
            "label": "Storage Integration",
            "key": "category:tutorials/development/volume/storage-integration",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/volume/storage-integration/integrate-with-aws-s3",
                "label": "AWS S3",
                "key": "doc:tutorials/development/volume/storage-integration/integrate-with-aws-s3"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Schema",
        "key": "category:tutorials/development/schema",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/schema/schema-explained",
            "label": "Overview",
            "key": "doc:tutorials/development/schema/schema-explained"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/primary-field-auto-id",
            "label": "Primary Field",
            "key": "doc:tutorials/development/schema/primary-field-auto-id"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-dense-vector",
            "label": "Dense Vector",
            "key": "doc:tutorials/development/schema/use-dense-vector"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-binary-vector",
            "label": "Binary Vector",
            "key": "doc:tutorials/development/schema/use-binary-vector"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-sparse-vector",
            "label": "Sparse Vector",
            "key": "doc:tutorials/development/schema/use-sparse-vector"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-string-field",
            "label": "VarChar",
            "key": "doc:tutorials/development/schema/use-string-field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-text-field",
            "label": "Text Field",
            "key": "doc:tutorials/development/schema/use-text-field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-number-field",
            "label": "Boolean & Number",
            "key": "doc:tutorials/development/schema/use-number-field"
          },
          {
            "type": "category",
            "label": "JSON Field",
            "key": "category:tutorials/development/schema/json-fields",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/schema/json-fields/json-field-overview",
                "label": "Overview",
                "key": "doc:tutorials/development/schema/json-fields/json-field-overview"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/json-fields/json-indexing",
                "label": "Indexing",
                "key": "doc:tutorials/development/schema/json-fields/json-indexing"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/json-fields/json-shredding",
                "label": "Shredding",
                "key": "doc:tutorials/development/schema/json-fields/json-shredding"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-array-fields",
            "label": "Array",
            "key": "doc:tutorials/development/schema/use-array-fields"
          },
          {
            "type": "category",
            "label": "StructArray",
            "key": "category:tutorials/development/schema/struct-array",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/schema/struct-array/use-array-of-structs",
                "label": "Overview",
                "key": "doc:tutorials/development/schema/struct-array/use-array-of-structs"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/struct-array/create-struct-array",
                "label": "Create a StructArray Field",
                "key": "doc:tutorials/development/schema/struct-array/create-struct-array"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/struct-array/insert-struct-array",
                "label": "Insert Data into StructArray Fields",
                "key": "doc:tutorials/development/schema/struct-array/insert-struct-array"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/struct-array/index-struct-array",
                "label": "Index StructArray Fields",
                "key": "doc:tutorials/development/schema/struct-array/index-struct-array"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/struct-array/struct-array-limits",
                "label": "StructArray Limits",
                "key": "doc:tutorials/development/schema/struct-array/struct-array-limits"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-geometry-field",
            "label": "Geometry",
            "key": "doc:tutorials/development/schema/use-geometry-field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/use-timestamptz-field",
            "label": "TIMSTAMPTZ",
            "key": "doc:tutorials/development/schema/use-timestamptz-field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/enable-dynamic-field",
            "label": "Dynamic Field",
            "key": "doc:tutorials/development/schema/enable-dynamic-field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/nullable-fields",
            "label": "Nullable Fields",
            "key": "doc:tutorials/development/schema/nullable-fields"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/default-fields",
            "label": "Default Values",
            "key": "doc:tutorials/development/schema/default-fields"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/alter-collection-field",
            "label": "Alter Field",
            "key": "doc:tutorials/development/schema/alter-collection-field"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/add-fields-to-an-existing-collection",
            "label": "Alter Schema (Managed Collection)",
            "key": "doc:tutorials/development/schema/add-fields-to-an-existing-collection"
          },
          {
            "type": "doc",
            "id": "tutorials/development/schema/alter-external-collection-schema",
            "label": "Alter Schema (External Collection)",
            "key": "doc:tutorials/development/schema/alter-external-collection-schema"
          },
          {
            "type": "category",
            "label": "Best Practices",
            "key": "category:tutorials/development/schema/schema-best-practices",
            "link": {
              "type": "doc",
              "id": "tutorials/development/schema/schema-best-practices/schema-best-practices"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/schema/schema-best-practices/schema-design-hands-on",
                "label": "Data Model Design",
                "key": "doc:tutorials/development/schema/schema-best-practices/schema-design-hands-on"
              },
              {
                "type": "doc",
                "id": "tutorials/development/schema/schema-best-practices/schema-design-with-structs",
                "label": "Data Model with Structs",
                "key": "doc:tutorials/development/schema/schema-best-practices/schema-design-with-structs"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Vector Index",
        "key": "category:tutorials/development/vector-index",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/vector-index/autoindex-explained",
            "label": "AUTOINDEX",
            "key": "doc:tutorials/development/vector-index/autoindex-explained"
          },
          {
            "type": "doc",
            "id": "tutorials/development/vector-index/minhash-lsh",
            "label": "MINHASH_LSH",
            "key": "doc:tutorials/development/vector-index/minhash-lsh"
          },
          {
            "type": "doc",
            "id": "tutorials/development/vector-index/tune-index-build-level",
            "label": "Tune Build Level",
            "key": "doc:tutorials/development/vector-index/tune-index-build-level"
          }
        ]
      },
      {
        "type": "category",
        "label": "Scalar Index",
        "key": "category:tutorials/development/scalar-index",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/bitmap-index-type",
            "label": "BITMAP",
            "key": "doc:tutorials/development/scalar-index/bitmap-index-type"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/inverted-index-type",
            "label": "INVERTED",
            "key": "doc:tutorials/development/scalar-index/inverted-index-type"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/ngram-index-type",
            "label": "NGRAM",
            "key": "doc:tutorials/development/scalar-index/ngram-index-type"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/rtree-index-type",
            "label": "RTREE",
            "key": "doc:tutorials/development/scalar-index/rtree-index-type"
          },
          {
            "type": "doc",
            "id": "tutorials/development/scalar-index/slt-sort-index-type",
            "label": "STL_SORT",
            "key": "doc:tutorials/development/scalar-index/slt-sort-index-type"
          }
        ]
      },
      {
        "type": "category",
        "label": "Insert & Delete",
        "key": "category:tutorials/development/insert-and-delete",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/insert-entities",
            "label": "Insert",
            "key": "doc:tutorials/development/insert-and-delete/insert-entities"
          },
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/upsert-entities",
            "label": "Upsert",
            "key": "doc:tutorials/development/insert-and-delete/upsert-entities"
          },
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/count-entities",
            "label": "Count",
            "key": "doc:tutorials/development/insert-and-delete/count-entities"
          },
          {
            "type": "doc",
            "id": "tutorials/development/insert-and-delete/delete-entities",
            "label": "Delete",
            "key": "doc:tutorials/development/insert-and-delete/delete-entities"
          }
        ]
      },
      {
        "type": "category",
        "label": "Data Import",
        "key": "category:tutorials/development/data-import",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/data-import/data-import-storage-options",
            "label": "Storage Options",
            "key": "doc:tutorials/development/data-import/data-import-storage-options"
          },
          {
            "type": "category",
            "label": "Format Options",
            "key": "category:tutorials/development/data-import/data-import-format-options",
            "link": {
              "type": "doc",
              "id": "tutorials/development/data-import/data-import-format-options/data-import-format-options"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/data-import/data-import-format-options/data-import-parquet",
                "label": "Parquet (Recommended)",
                "key": "doc:tutorials/development/data-import/data-import-format-options/data-import-parquet"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/data-import-format-options/data-import-json",
                "label": "JSON/JSON Line",
                "key": "doc:tutorials/development/data-import/data-import-format-options/data-import-json"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/data-import-format-options/data-import-numpy",
                "label": "NumPy",
                "key": "doc:tutorials/development/data-import/data-import-format-options/data-import-numpy"
              }
            ]
          },
          {
            "type": "category",
            "label": "Convert Your Data",
            "key": "category:tutorials/development/data-import/prepare-data-import",
            "link": {
              "type": "doc",
              "id": "tutorials/development/data-import/prepare-data-import/prepare-data-import"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/data-import/prepare-data-import/use-bulkwriter",
                "label": "Use BulkWriter",
                "key": "doc:tutorials/development/data-import/prepare-data-import/use-bulkwriter"
              }
            ]
          },
          {
            "type": "category",
            "label": "Import Data",
            "key": "category:tutorials/development/data-import/import-data",
            "link": {
              "type": "doc",
              "id": "tutorials/development/data-import/import-data/import-data"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/data-import/import-data/import-data-on-web-ui",
                "label": "Console",
                "key": "doc:tutorials/development/data-import/import-data/import-data-on-web-ui"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/import-data/import-data-via-restful-api",
                "label": "RESTful API",
                "key": "doc:tutorials/development/data-import/import-data/import-data-via-restful-api"
              },
              {
                "type": "doc",
                "id": "tutorials/development/data-import/import-data/import-data-via-sdks",
                "label": "SDKs",
                "key": "doc:tutorials/development/data-import/import-data/import-data-via-sdks"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/data-import/data-import-zero-to-hero",
            "label": "Zero to Hero",
            "key": "doc:tutorials/development/data-import/data-import-zero-to-hero"
          }
        ]
      },
      {
        "type": "category",
        "label": "Data Export",
        "key": "category:tutorials/development/data-export",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/data-export/export-data-iterators",
            "label": "Using Iterators",
            "key": "doc:tutorials/development/data-export/export-data-iterators"
          }
        ]
      },
      {
        "type": "category",
        "label": "Function",
        "key": "category:tutorials/development/function",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/function/function-and-model-inference-overview",
            "label": "Overview",
            "key": "doc:tutorials/development/function/function-and-model-inference-overview"
          },
          {
            "type": "doc",
            "id": "tutorials/development/function/bm25-function",
            "label": "BM25 Function",
            "key": "doc:tutorials/development/function/bm25-function"
          },
          {
            "type": "category",
            "label": "Text Embedding Functions",
            "key": "category:tutorials/development/function/text-embedding-funcs",
            "items": []
          },
          {
            "type": "doc",
            "id": "tutorials/development/function/minhash-function",
            "label": "MinHash Function",
            "key": "doc:tutorials/development/function/minhash-function"
          },
          {
            "type": "category",
            "label": "Reranking Functions",
            "key": "category:tutorials/development/function/reranking-functions",
            "items": [
              {
                "type": "category",
                "label": "Hybrid Search Rerankers",
                "key": "category:tutorials/development/function/reranking-functions/hybrid-search-rerankers",
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/development/function/reranking-functions/hybrid-search-rerankers/reranking-weighted-reranker",
                    "label": "Weighted Ranker",
                    "key": "doc:tutorials/development/function/reranking-functions/hybrid-search-rerankers/reranking-weighted-reranker"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/development/function/reranking-functions/hybrid-search-rerankers/reranking-rrf",
                    "label": "RRF Ranker",
                    "key": "doc:tutorials/development/function/reranking-functions/hybrid-search-rerankers/reranking-rrf"
                  }
                ]
              },
              {
                "type": "category",
                "label": "Rule-based Rerankers",
                "key": "category:tutorials/development/function/reranking-functions/rule-based-rerankers",
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/boost-ranker",
                    "label": "Boost Ranker",
                    "key": "doc:tutorials/development/function/reranking-functions/rule-based-rerankers/boost-ranker"
                  },
                  {
                    "type": "category",
                    "label": "Decay Rankers",
                    "key": "category:tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers",
                    "items": [
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/decay-ranker-oveview",
                        "label": "Decay Ranker Overview",
                        "key": "doc:tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/decay-ranker-oveview"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/gaussian-decay",
                        "label": "Gaussian Decay",
                        "key": "doc:tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/gaussian-decay"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/exponential-decay",
                        "label": "Exponential Decay",
                        "key": "doc:tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/exponential-decay"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/linear-decay",
                        "label": "Linear Decay",
                        "key": "doc:tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/linear-decay"
                      },
                      {
                        "type": "doc",
                        "id": "tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/tutorial-implement-time-based-ranking",
                        "label": "Tutorial: Implement Time-based Ranking",
                        "key": "doc:tutorials/development/function/reranking-functions/rule-based-rerankers/decay-rankers/tutorial-implement-time-based-ranking"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "category",
                "label": "Model-based Rerankers",
                "key": "category:tutorials/development/function/reranking-functions/model-based-rerankers",
                "items": []
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Analyzer",
        "key": "category:tutorials/development/analyzer",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/development/analyzer/analyzer-overview",
            "label": "Overview",
            "key": "doc:tutorials/development/analyzer/analyzer-overview"
          },
          {
            "type": "category",
            "label": "Built-in Analyzer",
            "key": "category:tutorials/development/analyzer/built-in-analyzer",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/built-in-analyzer/standard-analyzer",
                "label": "Standard",
                "key": "doc:tutorials/development/analyzer/built-in-analyzer/standard-analyzer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/built-in-analyzer/english-analyzer",
                "label": "English",
                "key": "doc:tutorials/development/analyzer/built-in-analyzer/english-analyzer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/built-in-analyzer/chinese-analyzer",
                "label": "Chinese",
                "key": "doc:tutorials/development/analyzer/built-in-analyzer/chinese-analyzer"
              }
            ]
          },
          {
            "type": "category",
            "label": "Tokenizer",
            "key": "category:tutorials/development/analyzer/analyzer-tokenizers",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-tokenizers/standard-tokenizer",
                "label": "Standard",
                "key": "doc:tutorials/development/analyzer/analyzer-tokenizers/standard-tokenizer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-tokenizers/whitespace-tokenizer",
                "label": "Whitespace",
                "key": "doc:tutorials/development/analyzer/analyzer-tokenizers/whitespace-tokenizer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-tokenizers/jieba-tokenizer",
                "label": "Jieba",
                "key": "doc:tutorials/development/analyzer/analyzer-tokenizers/jieba-tokenizer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-tokenizers/lindera-tokenizer",
                "label": "Lindera",
                "key": "doc:tutorials/development/analyzer/analyzer-tokenizers/lindera-tokenizer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-tokenizers/icu-tokenizer",
                "label": "ICU",
                "key": "doc:tutorials/development/analyzer/analyzer-tokenizers/icu-tokenizer"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-tokenizers/language-identifier-tokenizer",
                "label": "Language Identifier",
                "key": "doc:tutorials/development/analyzer/analyzer-tokenizers/language-identifier-tokenizer"
              }
            ]
          },
          {
            "type": "category",
            "label": "Analyzer Filters",
            "key": "category:tutorials/development/analyzer/analyzer-filters",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/lowercase-filter",
                "label": "Lowercase",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/lowercase-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/ascii-folding-filter",
                "label": "ASCII folding",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/ascii-folding-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/alphanumonly-filter",
                "label": "Alphanumonly",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/alphanumonly-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/cnalphanumonly-filter",
                "label": "Cnalphanumonly",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/cnalphanumonly-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/cncharonly-filter",
                "label": "Cncharonly",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/cncharonly-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/pinyin-filter",
                "label": "pinyin",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/pinyin-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/length-filter",
                "label": "Length",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/length-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/stop-filter",
                "label": "Stop",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/stop-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/decompounder-filter",
                "label": "Decompounder",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/decompounder-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/stemmer-filter",
                "label": "Stemmer",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/stemmer-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/remove-punct-filter",
                "label": "Remove Punct",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/remove-punct-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/regex-filter",
                "label": "Regex Analyzer Filter",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/regex-filter"
              },
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/synonym-filter",
                "label": "Synonym",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/synonym-filter"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/development/analyzer/multi-language-analyzers",
            "label": "Multi-language Analyzers",
            "key": "doc:tutorials/development/analyzer/multi-language-analyzers"
          },
          {
            "type": "doc",
            "id": "tutorials/development/analyzer/choose-the-right-analyzer-for-your-use-case",
            "label": "Best Practice",
            "key": "doc:tutorials/development/analyzer/choose-the-right-analyzer-for-your-use-case"
          },
          {
            "type": "doc",
            "id": "tutorials/development/analyzer/manage-file-resources",
            "label": "Manage File Resources",
            "key": "doc:tutorials/development/analyzer/manage-file-resources"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Management",
    "key": "category:tutorials/management",
    "items": [
      {
        "type": "category",
        "label": "Organizations",
        "key": "category:tutorials/management/organizations",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/organizations/organization-users",
            "label": "Organization Users",
            "key": "doc:tutorials/management/organizations/organization-users"
          },
          {
            "type": "doc",
            "id": "tutorials/management/organizations/organization-settings",
            "label": "Organization Settings",
            "key": "doc:tutorials/management/organizations/organization-settings"
          },
          {
            "type": "doc",
            "id": "tutorials/management/organizations/use-recycle-bin",
            "label": "Use Recycle Bin",
            "key": "doc:tutorials/management/organizations/use-recycle-bin"
          }
        ]
      },
      {
        "type": "category",
        "label": "Projects",
        "key": "category:tutorials/management/projects",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/projects/manage-projects",
            "label": "Projects",
            "key": "doc:tutorials/management/projects/manage-projects"
          },
          {
            "type": "doc",
            "id": "tutorials/management/projects/project-users",
            "label": "Project Users",
            "key": "doc:tutorials/management/projects/project-users"
          },
          {
            "type": "doc",
            "id": "tutorials/management/projects/job-center",
            "label": "Project Jobs",
            "key": "doc:tutorials/management/projects/job-center"
          }
        ]
      },
      {
        "type": "category",
        "label": "Clusters",
        "key": "category:tutorials/management/clusters",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/clusters/free-and-serverless-clusters",
            "label": "Free & Serverless Clusters",
            "key": "doc:tutorials/management/clusters/free-and-serverless-clusters"
          },
          {
            "type": "category",
            "label": "Dedicated Cluster",
            "key": "category:tutorials/management/clusters/dedicated-cluster",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/clusters/dedicated-cluster/create-cluster",
                "label": "Create Cluster",
                "key": "doc:tutorials/management/clusters/dedicated-cluster/create-cluster"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/dedicated-cluster/connect-to-clusters",
                "label": "Connect to Clusters",
                "key": "doc:tutorials/management/clusters/dedicated-cluster/connect-to-clusters"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/dedicated-cluster/manage-cluster",
                "label": "Manage Cluster",
                "key": "doc:tutorials/management/clusters/dedicated-cluster/manage-cluster"
              },
              {
                "type": "category",
                "label": "Scale Cluster",
                "key": "category:tutorials/management/clusters/dedicated-cluster/scale-cluster",
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/plan-cluster-scaling",
                    "label": "Plan Cluster Scaling",
                    "key": "doc:tutorials/management/clusters/dedicated-cluster/scale-cluster/plan-cluster-scaling"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/manual-scaling",
                    "label": "Manual Scaling",
                    "key": "doc:tutorials/management/clusters/dedicated-cluster/scale-cluster/manual-scaling"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/auto-scaling",
                    "label": "Auto-scaling",
                    "key": "doc:tutorials/management/clusters/dedicated-cluster/scale-cluster/auto-scaling"
                  },
                  {
                    "type": "category",
                    "label": "Scheduled Scaling",
                    "key": "category:tutorials/management/clusters/dedicated-cluster/scale-cluster/scheduled-scaling",
                    "link": {
                      "type": "doc",
                      "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/scheduled-scaling/scheduled-scaling"
                    },
                    "items": [
                      {
                        "type": "doc",
                        "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/scheduled-scaling/cron-expression",
                        "label": "Cron Expression",
                        "key": "doc:tutorials/management/clusters/dedicated-cluster/scale-cluster/scheduled-scaling/cron-expression"
                      }
                    ]
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/clusters/dedicated-cluster/scale-cluster/canary-upgrade",
                    "label": "Canary Upgrade",
                    "key": "doc:tutorials/management/clusters/dedicated-cluster/scale-cluster/canary-upgrade"
                  }
                ]
              },
              {
                "type": "link",
                "href": "/docs/byoc/database",
                "label": "Database in Serving Clusters",
                "key": "ref:tutorials/management/clusters/dedicated-cluster/database"
              }
            ]
          },
          {
            "type": "category",
            "label": "On-Demand Cluster",
            "key": "category:tutorials/management/clusters/on-demand-compute",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/clusters/on-demand-compute/on-demand-cluster",
                "label": "Create Cluster",
                "key": "doc:tutorials/management/clusters/on-demand-compute/on-demand-cluster"
              },
              {
                "type": "link",
                "href": "/docs/byoc/connect-for-on-demand-search",
                "label": "Connect for On-Demand Search",
                "key": "ref:tutorials/management/clusters/on-demand-compute/connect-for-on-demand-search"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/on-demand-compute/manage-on-demand-clusters",
                "label": "Manage Cluster",
                "key": "doc:tutorials/management/clusters/on-demand-compute/manage-on-demand-clusters"
              },
              {
                "type": "link",
                "href": "/docs/byoc/on-demand-database",
                "label": "Database for On-Demand Search",
                "key": "ref:tutorials/management/clusters/on-demand-compute/on-demand-database"
              }
            ]
          },
          {
            "type": "category",
            "label": "Global Cluster",
            "key": "category:tutorials/management/clusters/global-cluster",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/clusters/global-cluster/global-cluster-explained",
                "label": "Global Cluster Explained",
                "key": "doc:tutorials/management/clusters/global-cluster/global-cluster-explained"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/global-cluster/create-global-cluster",
                "label": "Create Global Cluster",
                "key": "doc:tutorials/management/clusters/global-cluster/create-global-cluster"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/global-cluster/connect-to-global-cluster",
                "label": "Connect to Global Cluster",
                "key": "doc:tutorials/management/clusters/global-cluster/connect-to-global-cluster"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/global-cluster/switchover-and-failover",
                "label": "Switchover and Failover",
                "key": "doc:tutorials/management/clusters/global-cluster/switchover-and-failover"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/global-cluster/scale-global-cluster",
                "label": "Scale Global Cluster",
                "key": "doc:tutorials/management/clusters/global-cluster/scale-global-cluster"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/global-cluster/monitor-global-cluster",
                "label": "Monitor Global Cluster",
                "key": "doc:tutorials/management/clusters/global-cluster/monitor-global-cluster"
              },
              {
                "type": "doc",
                "id": "tutorials/management/clusters/global-cluster/manage-global-cluster",
                "label": "Manage Global Cluster",
                "key": "doc:tutorials/management/clusters/global-cluster/manage-global-cluster"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Volume",
        "key": "category:tutorials/management/volume",
        "items": [
          {
            "type": "link",
            "href": "/docs/byoc/external-volume",
            "label": "External Volumes",
            "key": "ref:tutorials/management/volume/external-volume"
          },
          {
            "type": "category",
            "label": "Storage Integrations",
            "key": "category:tutorials/management/volume/storage-integrations",
            "items": [
              {
                "type": "link",
                "href": "/docs/byoc/integrate-with-aws-s3",
                "label": "Integrate with AWS S3",
                "key": "ref:tutorials/management/volume/storage-integrations/integrate-with-aws-s3"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Backup & Restore",
        "key": "category:tutorials/management/backup-and-restore",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/create-backup",
            "label": "Create Backup",
            "key": "doc:tutorials/management/backup-and-restore/create-backup"
          },
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/schedule-automatic-backups",
            "label": "Schedule Automatic Backups",
            "key": "doc:tutorials/management/backup-and-restore/schedule-automatic-backups"
          },
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/restore-from-backup-files",
            "label": "Restore from Backup Files",
            "key": "doc:tutorials/management/backup-and-restore/restore-from-backup-files"
          },
          {
            "type": "doc",
            "id": "tutorials/management/backup-and-restore/manage-backup-files",
            "label": "Manage Backup Files",
            "key": "doc:tutorials/management/backup-and-restore/manage-backup-files"
          }
        ]
      },
      {
        "type": "category",
        "label": "Migrations",
        "key": "category:tutorials/management/migrations",
        "items": [
          {
            "type": "category",
            "label": "Zilliz to Zilliz Migrations",
            "key": "category:tutorials/management/migrations/migrate-between-clusters",
            "link": {
              "type": "doc",
              "id": "tutorials/management/migrations/migrate-between-clusters/migrate-between-clusters"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/migrations/migrate-between-clusters/offline-migration",
                "label": "Offline Migration",
                "key": "doc:tutorials/management/migrations/migrate-between-clusters/offline-migration"
              }
            ]
          },
          {
            "type": "category",
            "label": "Migrate from Milvus",
            "key": "category:tutorials/management/migrations/migrate-from-milvus",
            "link": {
              "type": "doc",
              "id": "tutorials/management/migrations/migrate-from-milvus/migrate-from-milvus"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/migrations/migrate-from-milvus/via-backup-files",
                "label": "Via Backup Files",
                "key": "doc:tutorials/management/migrations/migrate-from-milvus/via-backup-files"
              }
            ]
          },
          {
            "type": "category",
            "label": "Migration from External Sources",
            "key": "category:tutorials/management/migrations/migrate-from-external-sources",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/migrations/migrate-from-external-sources/zilliz-cloud-ips",
                "label": "Zilliz Cloud IP Addresses",
                "key": "doc:tutorials/management/migrations/migrate-from-external-sources/zilliz-cloud-ips"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Metrics & Alerts",
        "key": "category:tutorials/management/metrics-alerts",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/metrics-alerts/metrics-alerts-reference",
            "label": "Metrics Reference",
            "key": "doc:tutorials/management/metrics-alerts/metrics-alerts-reference"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-alerts/view-cluster-metric-charts",
            "label": "View Metric Charts",
            "key": "doc:tutorials/management/metrics-alerts/view-cluster-metric-charts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-alerts/manage-organization-alerts",
            "label": "Manage Organization Alerts",
            "key": "doc:tutorials/management/metrics-alerts/manage-organization-alerts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-alerts/manage-project-alerts",
            "label": "Manage Project Alerts",
            "key": "doc:tutorials/management/metrics-alerts/manage-project-alerts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/metrics-alerts/manage-notification-channels",
            "label": "Manage Notification Channels",
            "key": "doc:tutorials/management/metrics-alerts/manage-notification-channels"
          },
          {
            "type": "category",
            "label": "Observability Integrations",
            "key": "category:tutorials/management/metrics-alerts/observability-integrations",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/metrics-alerts/observability-integrations/prometheus-monitoring",
                "label": "Prometheus",
                "key": "doc:tutorials/management/metrics-alerts/observability-integrations/prometheus-monitoring"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Access Control",
        "key": "category:tutorials/management/access-control",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/access-control/access-control-overview",
            "label": "Access Control Explained",
            "key": "doc:tutorials/management/access-control/access-control-overview"
          },
          {
            "type": "link",
            "href": "/docs/byoc/organization-users",
            "label": "Manage Organization Users",
            "key": "ref:tutorials/management/access-control/organization-users"
          },
          {
            "type": "link",
            "href": "/docs/byoc/project-users",
            "label": "Manage Project Users",
            "key": "ref:tutorials/management/access-control/project-users"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-users",
            "label": "Manage Cluster Users (Console)",
            "key": "doc:tutorials/management/access-control/cluster-users"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-users-sdk",
            "label": "Manage Cluster User (SDK)",
            "key": "doc:tutorials/management/access-control/cluster-users-sdk"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-roles",
            "label": "Manage Cluster Roles (Console)",
            "key": "doc:tutorials/management/access-control/cluster-roles"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-roles-sdk",
            "label": "Manage Cluster Roles (SDK)",
            "key": "doc:tutorials/management/access-control/cluster-roles-sdk"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-control/cluster-privileges",
            "label": "Privileges & Privilege Groups",
            "key": "doc:tutorials/management/access-control/cluster-privileges"
          },
          {
            "type": "category",
            "label": "SCIM Provisioning",
            "key": "category:tutorials/management/access-control/scim-provisioning",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/access-control/scim-provisioning/scim-provisioning-overview",
                "label": "SCIM Provisioning Overview",
                "key": "doc:tutorials/management/access-control/scim-provisioning/scim-provisioning-overview"
              },
              {
                "type": "doc",
                "id": "tutorials/management/access-control/scim-provisioning/configure-scim-provisioning-with-okta",
                "label": "Configure SCIM Provisioning with Okta",
                "key": "doc:tutorials/management/access-control/scim-provisioning/configure-scim-provisioning-with-okta"
              },
              {
                "type": "doc",
                "id": "tutorials/management/access-control/scim-provisioning/configure-scim-provisioning-with-microsoft-entra",
                "label": "Configure SCIM Provisioning with Microsoft Entra",
                "key": "doc:tutorials/management/access-control/scim-provisioning/configure-scim-provisioning-with-microsoft-entra"
              },
              {
                "type": "doc",
                "id": "tutorials/management/access-control/scim-provisioning/view-scim-synced-groups",
                "label": "View SCIM-Synced Groups",
                "key": "doc:tutorials/management/access-control/scim-provisioning/view-scim-synced-groups"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Authentication",
        "key": "category:tutorials/management/authentication",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/authentication/email-accounts",
            "label": "Email Accounts",
            "key": "doc:tutorials/management/authentication/email-accounts"
          },
          {
            "type": "doc",
            "id": "tutorials/management/authentication/manage-api-keys",
            "label": "API Keys",
            "key": "doc:tutorials/management/authentication/manage-api-keys"
          },
          {
            "type": "doc",
            "id": "tutorials/management/authentication/cluster-credentials",
            "label": "Cluster Credentials",
            "key": "doc:tutorials/management/authentication/cluster-credentials"
          },
          {
            "type": "doc",
            "id": "tutorials/management/authentication/multi-factor-auth",
            "label": "MFA",
            "key": "doc:tutorials/management/authentication/multi-factor-auth"
          },
          {
            "type": "category",
            "label": "Single Sign-on (SSO)",
            "key": "category:tutorials/management/authentication/single-sign-on",
            "link": {
              "type": "doc",
              "id": "tutorials/management/authentication/single-sign-on/single-sign-on"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/openid-connect",
                "label": "Okta (OIDC)",
                "key": "doc:tutorials/management/authentication/single-sign-on/openid-connect"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-okta",
                "label": "Okta (SAML 2.0)",
                "key": "doc:tutorials/management/authentication/single-sign-on/single-sign-on-with-okta"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-google-workspace",
                "label": "Google Workspace (SAML 2.0)",
                "key": "doc:tutorials/management/authentication/single-sign-on/single-sign-on-with-google-workspace"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-microsoft-entra",
                "label": "Microsoft Entra (SAML 2.0)",
                "key": "doc:tutorials/management/authentication/single-sign-on/single-sign-on-with-microsoft-entra"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/single-sign-on-with-other-idp",
                "label": "Other IdP (SAML 2.0)",
                "key": "doc:tutorials/management/authentication/single-sign-on/single-sign-on-with-other-idp"
              },
              {
                "type": "doc",
                "id": "tutorials/management/authentication/single-sign-on/enforce-sso-in-your-organization",
                "label": "Enforce SSO in Your Organization",
                "key": "doc:tutorials/management/authentication/single-sign-on/enforce-sso-in-your-organization"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "IP Allowlists",
        "key": "category:tutorials/management/ip-allowlists",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/ip-allowlists/setup-console-ip-allowlist",
            "label": "Set Up Console IP Allowlist",
            "key": "doc:tutorials/management/ip-allowlists/setup-console-ip-allowlist"
          }
        ]
      },
      {
        "type": "category",
        "label": "Private Endpoint",
        "key": "category:tutorials/management/private-endpoint",
        "items": []
      },
      {
        "type": "category",
        "label": "CMEK",
        "key": "category:tutorials/management/cmek",
        "link": {
          "type": "doc",
          "id": "tutorials/management/cmek/cmek"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/cmek/aws-kms",
            "label": "AWS KMS",
            "key": "doc:tutorials/management/cmek/aws-kms"
          }
        ]
      },
      {
        "type": "category",
        "label": "Audit Logs",
        "key": "category:tutorials/management/auditing",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/auditing/audit-logs",
            "label": "VectorDB Audit Logs",
            "key": "doc:tutorials/management/auditing/audit-logs"
          },
          {
            "type": "doc",
            "id": "tutorials/management/auditing/audit-logs-ref",
            "label": "VectorDB Audit Logs Reference",
            "key": "doc:tutorials/management/auditing/audit-logs-ref"
          },
          {
            "type": "doc",
            "id": "tutorials/management/auditing/view-activities",
            "label": "View Platform Audit Logs",
            "key": "doc:tutorials/management/auditing/view-activities"
          }
        ]
      },
      {
        "type": "category",
        "label": "Access Logs",
        "key": "category:tutorials/management/access-logs",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/access-logs/access-log-overview",
            "label": "Access Logs Overview",
            "key": "doc:tutorials/management/access-logs/access-log-overview"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-logs/configure-access-logs",
            "label": "Configure Access Logs",
            "key": "doc:tutorials/management/access-logs/configure-access-logs"
          },
          {
            "type": "doc",
            "id": "tutorials/management/access-logs/access-log-reference",
            "label": "Access Log Reference",
            "key": "doc:tutorials/management/access-logs/access-log-reference"
          }
        ]
      },
      {
        "type": "category",
        "label": "Slow Logs",
        "key": "category:tutorials/management/slow-logs",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/slow-logs/configure-slow-logs",
            "label": "Configure Slow Logs",
            "key": "doc:tutorials/management/slow-logs/configure-slow-logs"
          },
          {
            "type": "doc",
            "id": "tutorials/management/slow-logs/slow-log-reference",
            "label": "Slow Logs Reference",
            "key": "doc:tutorials/management/slow-logs/slow-log-reference"
          }
        ]
      },
      {
        "type": "category",
        "label": "Billing Management",
        "key": "category:tutorials/management/billing-management",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/billing-management/understand-byoc-billing",
            "label": "Understand BYOC Billing",
            "key": "doc:tutorials/management/billing-management/understand-byoc-billing"
          },
          {
            "type": "doc",
            "id": "tutorials/management/billing-management/payment-billing",
            "label": "Payment and Billing Overview",
            "key": "doc:tutorials/management/billing-management/payment-billing"
          },
          {
            "type": "category",
            "label": "Set Up Payment Method",
            "key": "category:tutorials/management/billing-management/set-up-payment-method",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/management/billing-management/set-up-payment-method/credits",
                "label": "Credits",
                "key": "doc:tutorials/management/billing-management/set-up-payment-method/credits"
              },
              {
                "type": "doc",
                "id": "tutorials/management/billing-management/set-up-payment-method/subscribe-by-adding-credit-card",
                "label": "Credit Card",
                "key": "doc:tutorials/management/billing-management/set-up-payment-method/subscribe-by-adding-credit-card"
              },
              {
                "type": "doc",
                "id": "tutorials/management/billing-management/set-up-payment-method/advance-pay",
                "label": "Advance Pay",
                "key": "doc:tutorials/management/billing-management/set-up-payment-method/advance-pay"
              },
              {
                "type": "category",
                "label": "Marketplace Subscription",
                "key": "category:tutorials/management/billing-management/set-up-payment-method/marketplace-subscription",
                "link": {
                  "type": "doc",
                  "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/marketplace-subscription"
                },
                "items": [
                  {
                    "type": "doc",
                    "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-aws-marketplace",
                    "label": "AWS Marketplace (Public Offer)",
                    "key": "doc:tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-aws-marketplace"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-aws-marketplace-private-offer",
                    "label": "AWS Marketplace (Private Offer)",
                    "key": "doc:tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-aws-marketplace-private-offer"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-gcp-marketplace",
                    "label": "Google Cloud Marketplace (Public Offer)",
                    "key": "doc:tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-gcp-marketplace"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-gcp-marketplace-private-offer",
                    "label": "Google Cloud Marketplace (Private Offer)",
                    "key": "doc:tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-gcp-marketplace-private-offer"
                  },
                  {
                    "type": "doc",
                    "id": "tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-azure-marketplace",
                    "label": "Microsoft Marketplace (Public Offer)",
                    "key": "doc:tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-azure-marketplace"
                  }
                ]
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/management/billing-management/update-payment-method",
            "label": "Update Payment Method",
            "key": "doc:tutorials/management/billing-management/update-payment-method"
          },
          {
            "type": "doc",
            "id": "tutorials/management/billing-management/update-billing-profile",
            "label": "Update Billing Profile",
            "key": "doc:tutorials/management/billing-management/update-billing-profile"
          },
          {
            "type": "doc",
            "id": "tutorials/management/billing-management/view-invoice",
            "label": "Understand Invoices",
            "key": "doc:tutorials/management/billing-management/view-invoice"
          },
          {
            "type": "doc",
            "id": "tutorials/management/billing-management/manage-invoice",
            "label": "Manage Invoices",
            "key": "doc:tutorials/management/billing-management/manage-invoice"
          },
          {
            "type": "category",
            "label": "Separate Billing by Marketplace Account",
            "key": "category:tutorials/management/billing-management/separate-billing",
            "items": []
          }
        ]
      },
      {
        "type": "category",
        "label": "Cost Management",
        "key": "category:tutorials/management/cost-management",
        "items": [
          {
            "type": "category",
            "label": "Understand Cost",
            "key": "category:tutorials/management/cost-management/understand-cost",
            "items": []
          },
          {
            "type": "doc",
            "id": "tutorials/management/cost-management/analyze-cost",
            "label": "Analyze Cost",
            "key": "doc:tutorials/management/cost-management/analyze-cost"
          }
        ]
      },
      {
        "type": "category",
        "label": "Zilliz Cloud Limits",
        "key": "category:tutorials/management/limits",
        "link": {
          "type": "doc",
          "id": "tutorials/management/limits/limits"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/limits/api-comparison",
            "label": "API Availability",
            "key": "doc:tutorials/management/limits/api-comparison"
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "Client Libraries",
    "key": "category:tutorials/client-libraries",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/client-libraries/install-sdks",
        "label": "Install SDKs",
        "key": "doc:tutorials/client-libraries/install-sdks"
      },
      {
        "type": "link",
        "href": "/reference/restful",
        "label": "RESTful API",
        "key": "link:tutorials/client-libraries/restful-api"
      },
      {
        "type": "link",
        "href": "/reference/python",
        "label": "Python",
        "key": "link:tutorials/client-libraries/python"
      },
      {
        "type": "link",
        "href": "/reference/java",
        "label": "Java",
        "key": "link:tutorials/client-libraries/java"
      },
      {
        "type": "link",
        "href": "/reference/go",
        "label": "Go",
        "key": "link:tutorials/client-libraries/go"
      },
      {
        "type": "link",
        "href": "/reference/nodejs",
        "label": "Node.js",
        "key": "link:tutorials/client-libraries/nodejs"
      },
      {
        "type": "link",
        "href": "/reference/cpp",
        "label": "C++",
        "key": "link:tutorials/client-libraries/cpp"
      }
    ]
  },
  {
    "type": "category",
    "label": "Tools",
    "key": "category:tutorials/tools",
    "items": [
      {
        "type": "category",
        "label": "Agents & Prompts",
        "key": "category:tutorials/tools/agents-and-prompts",
        "link": {
          "type": "doc",
          "id": "tutorials/tools/agents-and-prompts/agents-and-prompts"
        },
        "items": [
          {
            "type": "doc",
            "id": "tutorials/tools/agents-and-prompts/zilliz-skill",
            "label": "Zilliz Skill",
            "key": "doc:tutorials/tools/agents-and-prompts/zilliz-skill"
          },
          {
            "type": "category",
            "label": "Claude Code Plugin",
            "key": "category:tutorials/tools/agents-and-prompts/zilliz-plugin",
            "link": {
              "type": "doc",
              "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-setup",
                "label": "Setup",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-setup"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-capabilities",
                "label": "Core Capabilities",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-capabilities"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-examples",
                "label": "More Examples",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-plugin/zilliz-plugin-examples"
              }
            ]
          },
          {
            "type": "doc",
            "id": "tutorials/tools/agents-and-prompts/zilliz-gemini-extension",
            "label": "Gemini CLI Extension",
            "key": "doc:tutorials/tools/agents-and-prompts/zilliz-gemini-extension"
          },
          {
            "type": "category",
            "label": "AI Prompts",
            "key": "category:tutorials/tools/agents-and-prompts/zilliz-ai-prompts",
            "link": {
              "type": "doc",
              "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-ai-prompts"
            },
            "items": [
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-base-prompts",
                "label": "Base Prompt",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-base-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-schema-design-prompts",
                "label": "Schema Design",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-schema-design-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-search-prompts",
                "label": "Search",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-search-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-import-prompts",
                "label": "Import",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-import-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-migration-prompts",
                "label": "Migration",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-migration-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-access-control-prompts",
                "label": "Access Control",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-access-control-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-integrations-prompts",
                "label": "Integrations",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/zilliz-integrations-prompts"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/indexes",
                "label": "Indexes",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/indexes"
              },
              {
                "type": "doc",
                "id": "tutorials/tools/agents-and-prompts/zilliz-ai-prompts/agent-plugins-and-extensions",
                "label": "Agent Plugins and Extensions",
                "key": "doc:tutorials/tools/agents-and-prompts/zilliz-ai-prompts/agent-plugins-and-extensions"
              }
            ]
          }
        ]
      },
      {
        "type": "doc",
        "id": "tutorials/tools/terraform-provider",
        "label": "Terraform Provider",
        "key": "doc:tutorials/tools/terraform-provider"
      },
      {
        "type": "link",
        "href": "/reference/cli/cli/overview",
        "label": "Zilliz CLI",
        "key": "link:tutorials/tools/zilliz-cli"
      }
    ]
  },
  {
    "type": "category",
    "label": "AI Models",
    "key": "category:tutorials/ai-models",
    "items": [
      {
        "type": "category",
        "label": "Text Embedding Models",
        "key": "category:tutorials/ai-models/text-embedding-models",
        "items": []
      },
      {
        "type": "category",
        "label": "Reranking Models",
        "key": "category:tutorials/ai-models/reranking-models",
        "items": []
      }
    ]
  },
  {
    "type": "category",
    "label": "Architecture",
    "key": "category:tutorials/architecture",
    "items": [
      {
        "type": "doc",
        "id": "tutorials/architecture/data-resilience",
        "label": "Data Resilience",
        "key": "doc:tutorials/architecture/data-resilience"
      },
      {
        "type": "doc",
        "id": "tutorials/architecture/data-security",
        "label": "Data Security",
        "key": "doc:tutorials/architecture/data-security"
      },
      {
        "type": "category",
        "label": "Best Practices",
        "key": "category:tutorials/architecture/best-practices",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/architecture/best-practices/multi-tenancy",
            "label": "Implement Multi-tenancy",
            "key": "doc:tutorials/architecture/best-practices/multi-tenancy"
          },
          {
            "type": "doc",
            "id": "tutorials/architecture/best-practices/environment-isolation",
            "label": "Environment Isolation",
            "key": "doc:tutorials/architecture/best-practices/environment-isolation"
          },
          {
            "type": "doc",
            "id": "tutorials/architecture/best-practices/perf-benchmark-vectordb",
            "label": "Performance Benchmarking with VectorDBBench",
            "key": "doc:tutorials/architecture/best-practices/perf-benchmark-vectordb"
          }
        ]
      }
    ]
  }
]
