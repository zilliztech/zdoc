module.exports = [
  {
    "type": "category",
    "label": "Development",
    "key": "category:tutorials/development",
    "items": [
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
            "id": "tutorials/development/database/database",
            "label": "Database in Serving Clusters",
            "key": "doc:tutorials/development/database/database"
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
            "id": "tutorials/development/volume/managed-volume",
            "label": "Managed Volumes",
            "key": "doc:tutorials/development/volume/managed-volume"
          }
        ]
      },
      {
        "type": "category",
        "label": "Analyzer",
        "key": "category:tutorials/development/analyzer",
        "items": [
          {
            "type": "category",
            "label": "Analyzer Filters",
            "key": "category:tutorials/development/analyzer/analyzer-filters",
            "items": [
              {
                "type": "doc",
                "id": "tutorials/development/analyzer/analyzer-filters/pinyin-filter",
                "label": "pinyin",
                "key": "doc:tutorials/development/analyzer/analyzer-filters/pinyin-filter"
              }
            ]
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
            "type": "category",
            "label": "Dedicated Cluster",
            "key": "category:tutorials/management/clusters/dedicated-cluster",
            "items": [
              {
                "type": "ref",
                "id": "tutorials/development/database/database",
                "label": "Database in Serving Clusters",
                "key": "ref:tutorials/management/clusters/dedicated-cluster/database"
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
            "type": "ref",
            "id": "tutorials/development/volume/managed-volume",
            "label": "Managed Volumes",
            "key": "ref:tutorials/management/volume/managed-volume"
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
          }
        ]
      },
      {
        "type": "category",
        "label": "Metrics & Alerts",
        "key": "category:tutorials/management/metrics-and-alerts",
        "items": [
          {
            "type": "doc",
            "id": "tutorials/management/metrics-and-alerts/metrics-alerts-reference",
            "label": "Metrics Reference",
            "key": "doc:tutorials/management/metrics-and-alerts/metrics-alerts-reference"
          }
        ]
      },
      {
        "type": "category",
        "label": "Access Control",
        "key": "category:tutorials/management/access-control",
        "items": [
          {
            "type": "ref",
            "id": "tutorials/management/organizations/organization-users",
            "label": "Manage Organization Users",
            "key": "ref:tutorials/management/access-control/organization-users"
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
            "id": "tutorials/management/billing-management/payment-billing",
            "label": "Payment and Billing Overview",
            "key": "doc:tutorials/management/billing-management/payment-billing"
          },
          {
            "type": "category",
            "label": "Set up Payment Method",
            "key": "category:tutorials/management/billing-management/set-up-payment-method",
            "items": [
              {
                "type": "category",
                "label": "Marketplace Subscription",
                "key": "category:tutorials/management/billing-management/set-up-payment-method/marketplace-subscription",
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
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Cost Management",
        "key": "category:tutorials/management/cost-management",
        "items": [
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
        "items": []
      }
    ]
  },
  {
    "type": "category",
    "label": "Client Libraries",
    "key": "category:tutorials/client-libraries",
    "items": [
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
        "type": "link",
        "href": "/reference/cli/cli/overview",
        "label": "Zilliz CLI",
        "key": "link:tutorials/tools/zilliz-cli"
      }
    ]
  }
]
