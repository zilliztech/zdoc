module.exports = [
  {
    "type": "doc",
    "id": "api/restful/restful/restful",
    "label": "RESTful API 参考"
  },
  {
    "type": "category",
    "label": "V2",
    "key": "category:v2",
    "items": [
      {
        "type": "category",
        "label": "Control Plane (V2)",
        "key": "category:v2/control-plane-v2",
        "items": [
          {
            "type": "category",
            "label": "Import Operations (V2)",
            "key": "category:v2/control-plane-v2/import-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/import-operations-v2/create-import-jobs-v2",
                "label": "创建导入任务 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/import-operations-v2/create-import-jobs-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/import-operations-v2/list-import-jobs-v2",
                "label": "查看导入任务列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/import-operations-v2/list-import-jobs-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/import-operations-v2/get-import-job-progress-v2",
                "label": "查看导入任务进度 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/import-operations-v2/get-import-job-progress-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cloud Meta (V2)",
            "key": "category:v2/control-plane-v2/cloud-meta-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-providers-v2",
                "label": "查看云服务提供商 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-providers-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-regions-v2",
                "label": "查看云服务区域 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-regions-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Extract, Load & Transform (V2)",
            "key": "category:v2/control-plane-v2/extract-load-and-transform-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/extract-load-and-transform-v2/merge-data-v2",
                "label": "合并数据 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/extract-load-and-transform-v2/merge-data-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Volume Operations (V2)",
            "key": "category:v2/control-plane-v2/volume-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/list-volumes-v2",
                "label": "查看 Volume 列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/list-volumes-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/create-volume-v2",
                "label": "创建 Volume (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/create-volume-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/describe-volume-v2",
                "label": "查看 Volume 详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/describe-volume-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/delete-volume-v2",
                "label": "删除 Volume (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/delete-volume-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/update-volume-v2",
                "label": "更新 Volume (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/update-volume-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Project Operations (V2)",
            "key": "category:v2/control-plane-v2/project-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/list-projects-v2",
                "label": "查看项目列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/list-projects-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/create-project-v2",
                "label": "创建项目 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/create-project-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/update-project-v2",
                "label": "更新项目 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/update-project-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/describe-project-v2",
                "label": "查看项目详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/describe-project-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/delete-project-v2",
                "label": "删除项目 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/delete-project-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/add-project-region-v2",
                "label": "添加项目地域 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/add-project-region-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cluster Operations (V2)",
            "key": "category:v2/control-plane-v2/cluster-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/list-clusters-v2",
                "label": "查看集群列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/list-clusters-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/create-dedicated-cluster-v2",
                "label": "创建 Dedicated 集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/create-dedicated-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/create-free-cluster-v2",
                "label": "创建 Free 集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/create-free-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/create-serverless-cluster-v2",
                "label": "创建 Serverless 集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/create-serverless-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/describe-cluster-v2",
                "label": "查看集群详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/describe-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/update-dedicated-cluster-v2",
                "label": "更新 Dedicated 集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/update-dedicated-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/drop-cluster-v2",
                "label": "删除集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/drop-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-v2",
                "label": "修改集群配置 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-replica-v2",
                "label": "修改集群副本数量 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-replica-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/resume-cluster-v2",
                "label": "恢复集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/resume-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/suspend-cluster-v2",
                "label": "挂起集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/suspend-cluster-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cloud Migration (V2)",
            "key": "category:v2/control-plane-v2/cloud-migration-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-from-remote-v2",
                "label": "从远端迁移 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-from-remote-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-existing-cluster-v2",
                "label": "迁移数据至现有集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-existing-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-new-dedicated-cluster-v2",
                "label": "迁移数据至新集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-new-dedicated-cluster-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Backup & Restore (V2)",
            "key": "category:v2/control-plane-v2/backup-and-restore-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/list-backups-v2",
                "label": "查看备份列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/list-backups-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/describe-backup-v2",
                "label": "查看备份详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/describe-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/delete-backup-v2",
                "label": "删除备份 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/delete-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/export-backup-files-v2",
                "label": "导出备份文件 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/export-backup-files-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/create-backup-v2",
                "label": "创建备份 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/create-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/get-backup-policy-v2",
                "label": "获取备份策略 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/get-backup-policy-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/set-backup-policy-v2",
                "label": "创建备份策略 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/set-backup-policy-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-cluster-backup-v2",
                "label": "恢复集群备份 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-cluster-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-collection-backup-v2",
                "label": "恢复 Collection 备份 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-collection-backup-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Metrics & Alerts (V2)",
            "key": "category:v2/control-plane-v2/metrics-and-alerts-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/list-alert-rules-v2",
                "label": "查看告警规则列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/list-alert-rules-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/create-alert-rule-v2",
                "label": "创建告警规则 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/create-alert-rule-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/update-alert-rule-v2",
                "label": "更新告警规则 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/update-alert-rule-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/delete-alert-rule-v2",
                "label": "删除告警规则 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/delete-alert-rule-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/query-cluster-metrics-v2",
                "label": "查询集群指标 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/query-cluster-metrics-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cloud Job (V2)",
            "key": "category:v2/control-plane-v2/cloud-job-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-job-v2/describe-job-v2",
                "label": "查看任务详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-job-v2/describe-job-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Invoices (V2)",
            "key": "category:v2/control-plane-v2/invoices-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/invoices-v2/list-invoices-v2",
                "label": "查看发票列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/invoices-v2/list-invoices-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/invoices-v2/describe-invoice-v2",
                "label": "查看发票详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/invoices-v2/describe-invoice-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Usage (V2)",
            "key": "category:v2/control-plane-v2/usage-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/usage-v2/query-daily-usage-v2",
                "label": "查询日用量 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/usage-v2/query-daily-usage-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "On-Demand Compute (V2)",
            "key": "category:v2/control-plane-v2/on-demand-compute-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-compute-v2/enable-on-demand-compute-v2",
                "label": "启用按需计算 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-compute-v2/enable-on-demand-compute-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-compute-v2/describe-on-demand-compute-v2",
                "label": "查看按需计算状态 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-compute-v2/describe-on-demand-compute-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Global Clusters (V2)",
            "key": "category:v2/control-plane-v2/global-clusters-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/list-available-global-cluster-regions-v2",
                "label": "列出可用全球集群地域 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/list-available-global-cluster-regions-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/list-global-clusters-v2",
                "label": "列出全球集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/list-global-clusters-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/create-global-cluster-v2",
                "label": "创建全球集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/create-global-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/describe-global-cluster-v2",
                "label": "查看全球集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/describe-global-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/get-global-cluster-replication-lag-v2",
                "label": "获取全球集群复制延迟 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/get-global-cluster-replication-lag-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/add-secondary-clusters-v2",
                "label": "添加从集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/add-secondary-clusters-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/delete-global-member-cluster-v2",
                "label": "删除全球集群成员集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/delete-global-member-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/switchover-global-cluster-v2",
                "label": "切换全球集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/switchover-global-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/failover-global-cluster-v2",
                "label": "故障转移全球集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/failover-global-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/modify-global-cluster-cu-v2",
                "label": "修改全球集群 CU (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/modify-global-cluster-cu-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/remove-global-endpoint-v2",
                "label": "移除全球端点 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/remove-global-endpoint-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/global-clusters-v2/convert-cluster-to-global-cluster-v2",
                "label": "转换集群为全球集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/global-clusters-v2/convert-cluster-to-global-cluster-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Storage Integration Operations (V2)",
            "key": "category:v2/control-plane-v2/storage-integration-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/storage-integration-operations-v2/list-storage-integrations-v2",
                "label": "列出 Storage Integration (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/storage-integration-operations-v2/list-storage-integrations-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/storage-integration-operations-v2/create-storage-integration-v2",
                "label": "创建 Storage Integration (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/storage-integration-operations-v2/create-storage-integration-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/storage-integration-operations-v2/describe-storage-integration-v2",
                "label": "查看 Storage Integration (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/storage-integration-operations-v2/describe-storage-integration-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/storage-integration-operations-v2/delete-storage-integration-v2",
                "label": "删除 Storage Integration (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/storage-integration-operations-v2/delete-storage-integration-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/storage-integration-operations-v2/validate-storage-integration-v2",
                "label": "校验 Storage Integration (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/storage-integration-operations-v2/validate-storage-integration-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/storage-integration-operations-v2/generate-storage-integration-authorization-materials-v2",
                "label": "生成 Storage Integration 授权材料 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/storage-integration-operations-v2/generate-storage-integration-authorization-materials-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Spark Job (V2)",
            "key": "category:v2/control-plane-v2/spark-job-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/spark-job-v2/list-spark-jobs-v2",
                "label": "列出 Spark 任务 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/spark-job-v2/list-spark-jobs-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/spark-job-v2/create-spark-job-v2",
                "label": "创建 Spark 任务 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/spark-job-v2/create-spark-job-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/spark-job-v2/validate-spark-job-artifact-v2",
                "label": "校验 Spark 任务 Artifact (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/spark-job-v2/validate-spark-job-artifact-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/spark-job-v2/describe-spark-job-v2",
                "label": "查看 Spark 任务详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/spark-job-v2/describe-spark-job-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/spark-job-v2/cancel-spark-job-v2",
                "label": "取消 Spark 任务 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/spark-job-v2/cancel-spark-job-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "On-Demand Cluster Operations (V2)",
            "key": "category:v2/control-plane-v2/on-demand-cluster-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/create-on-demand-cluster-v2",
                "label": "创建按需集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/create-on-demand-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/list-on-demand-clusters-v2",
                "label": "查看按需集群列表 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/list-on-demand-clusters-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/delete-on-demand-cluster-v2",
                "label": "删除按需集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/delete-on-demand-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/describe-on-demand-cluster-v2",
                "label": "查看按需集群详情 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/describe-on-demand-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/update-on-demand-cluster-v2",
                "label": "更新按需集群 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/update-on-demand-cluster-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cloud Access Control Operations (V2)",
            "key": "category:v2/control-plane-v2/cloud-access-control-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-cloud-roles-v2",
                "label": "列出 Cloud 角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-cloud-roles-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/create-cloud-role-v2",
                "label": "创建 Cloud 角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/create-cloud-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/describe-cloud-role-v2",
                "label": "查看 Cloud 角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/describe-cloud-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/update-cloud-role-v2",
                "label": "更新 Cloud 角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/update-cloud-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/delete-cloud-role-v2",
                "label": "删除 Cloud 角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/delete-cloud-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-cloud-role-principals-v2",
                "label": "列出 Cloud 角色主体 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-cloud-role-principals-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-member-roles-v2",
                "label": "列出成员角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-member-roles-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/grant-role-to-member-v2",
                "label": "为成员授予角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/grant-role-to-member-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/revoke-role-from-member-v2",
                "label": "撤销成员角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/revoke-role-from-member-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-groups-v2",
                "label": "列出群组 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-groups-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-group-roles-v2",
                "label": "列出群组角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-group-roles-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-group-members-v2",
                "label": "列出群组成员 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/list-group-members-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/grant-role-to-group-v2",
                "label": "为群组授予角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/grant-role-to-group-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/revoke-role-from-group-v2",
                "label": "撤销群组角色 (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/revoke-role-from-group-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cloud API Key Operations (V2)",
            "key": "category:v2/control-plane-v2/cloud-api-key-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/list-api-keys-v2",
                "label": "列出 API Key (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/list-api-keys-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/create-api-key-v2",
                "label": "创建 API Key (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/create-api-key-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/describe-api-key-v2",
                "label": "查看 API Key (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/describe-api-key-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/update-api-key-v2",
                "label": "更新 API Key (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/update-api-key-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/delete-api-key-v2",
                "label": "删除 API Key (V2)",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/delete-api-key-v2"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Data Plane (V2)",
        "key": "category:v2/data-plane-v2",
        "items": [
          {
            "type": "category",
            "label": "Vector Operations (V2)",
            "key": "category:v2/data-plane-v2/vector-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/delete-v2",
                "label": "删除 Entity (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/delete-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/insert-v2",
                "label": "插入 Entity (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/insert-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/upsert-v2",
                "label": "Upsert (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/upsert-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/query-v2",
                "label": "查询 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/query-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/search-v2",
                "label": "搜索 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/search-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/hybrid-search-v2",
                "label": "Hybrid Search (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/hybrid-search-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/get-v2",
                "label": "获取 Entity (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/get-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Collection Operations (V2)",
            "key": "category:v2/data-plane-v2/collection-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/list-collections-v2",
                "label": "查看 Collection 列表 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/list-collections-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/create-collection-v2",
                "label": "创建 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/create-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/flush-collection-v2",
                "label": "Flush Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/flush-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/compact-collection-v2",
                "label": "Compact Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/compact-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/get-compaction-state-v2",
                "label": "查看 Compaction 状态 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/get-compaction-state-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/describe-collection-v2",
                "label": "查看 Collection 详情 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/describe-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-v2",
                "label": "删除 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/truncate-collection-v2",
                "label": "清空 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/truncate-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/has-collection-v2",
                "label": "查看 Collection 是否存在 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/has-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-stats-v2",
                "label": "获取 Collection 统计信息 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-stats-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/refresh-load-v2",
                "label": "重新加载 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/refresh-load-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/alter-collection-properties-v2",
                "label": "修改 Collection 属性 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/alter-collection-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-properties-v2",
                "label": "删除 Collection 属性 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/add-collection-field-v2",
                "label": "添加 Collection 字段 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/add-collection-field-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/alter-field-properties-v2",
                "label": "修改字段属性 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/alter-field-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/rename-collection-v2",
                "label": "重命名 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/rename-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/load-collection-v2",
                "label": "加载 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/load-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/release-collection-v2",
                "label": "释放 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/release-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-load-state-v2",
                "label": "查看 Collection 加载状态 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-load-state-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/add-function-to-collection-v2",
                "label": "向 Collection 添加 Function (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/add-function-to-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/alter-function-in-collection-v2",
                "label": "修改 Collection 的 Function (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/alter-function-in-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/drop-function-from-collection-v2",
                "label": "从 Collection 删除 Function (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/drop-function-from-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/run-analyzer-v2",
                "label": "运行分析器 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/run-analyzer-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/refresh-external-collection-v2",
                "label": "刷新外部 Collection (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/refresh-external-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/describe-external-collection-refresh-job-v2",
                "label": "查看外部 Collection 刷新任务 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/describe-external-collection-refresh-job-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/list-external-collection-refresh-jobs-v2",
                "label": "列出外部 Collection 刷新任务 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/list-external-collection-refresh-jobs-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Database Operations (V2)",
            "key": "category:v2/data-plane-v2/database-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/create-database-v2",
                "label": "创建 Database (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/create-database-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/list-databases-v2",
                "label": "查看 Database 列表 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/list-databases-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/describe-database-v2",
                "label": "查看 Database 详情 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/describe-database-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/drop-database-properties-v2",
                "label": "删除 Database 属性 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/drop-database-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/drop-database-v2",
                "label": "删除 Database (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/drop-database-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/alter-database-properties-v2",
                "label": "修改数据库属性 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/alter-database-properties-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Index Operations (V2)",
            "key": "category:v2/data-plane-v2/index-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/create-index-v2",
                "label": "创建索引 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/create-index-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/describe-index-v2",
                "label": "查看索引详情 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/describe-index-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/alter-index-properties-v2",
                "label": "修改索引属性 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/alter-index-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/drop-index-properties-v2",
                "label": "删除索引属性 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/drop-index-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/drop-index-v2",
                "label": "删除索引 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/drop-index-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/list-indexes-v2",
                "label": "查看索引列表 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/list-indexes-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Partition Operations (V2)",
            "key": "category:v2/data-plane-v2/partition-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/list-partitions-v2",
                "label": "查看 Partition 列表 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/list-partitions-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/create-partition-v2",
                "label": "创建 Partition (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/create-partition-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/load-partitions-v2",
                "label": "加载 Partition (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/load-partitions-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/release-partitions-v2",
                "label": "释放 Partition (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/release-partitions-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/has-partition-v2",
                "label": "查看 Partition 是否存在 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/has-partition-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/get-partition-statistics-v2",
                "label": "查看 Partition 统计信息 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/get-partition-statistics-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/drop-partition-v2",
                "label": "删除 Partition (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/drop-partition-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cluster Role Operations (V2)",
            "key": "category:v2/data-plane-v2/cluster-role-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/list-roles-v2",
                "label": "查看角色列表 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/list-roles-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/describe-role-v2",
                "label": "查看角色详情 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/describe-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/create-role-v2",
                "label": "创建角色 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/create-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/grant-object-privilege-to-role-v2",
                "label": "为角色授予对象权限 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/grant-object-privilege-to-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/revoke-object-privilege-from-role-v2",
                "label": "撤销角色的对象权限 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/revoke-object-privilege-from-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/drop-role-v2",
                "label": "删除角色 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/drop-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/grant-privilege-to-role-v2",
                "label": "授予角色权限 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/grant-privilege-to-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/revoke-privilege-from-role-v2",
                "label": "撤销角色权限 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/revoke-privilege-from-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-role-operations-v2/alter-role-v2",
                "label": "修改角色 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-role-operations-v2/alter-role-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Alias Operations (V2)",
            "key": "category:v2/data-plane-v2/alias-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/list-aliases-v2",
                "label": "查看 Alias 列表 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/list-aliases-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/describe-alias-v2",
                "label": "查看 Alias 详情 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/describe-alias-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/alter-alias-v2",
                "label": "修改 Alias (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/alter-alias-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/drop-alias-v2",
                "label": "删除 Alias (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/drop-alias-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/create-alias-v2",
                "label": "创建 Alias (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/create-alias-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cluster User Operations (V2)",
            "key": "category:v2/data-plane-v2/cluster-user-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-user-operations-v2/create-user-v2",
                "label": "创建用户 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-user-operations-v2/create-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-user-operations-v2/describe-user-v2",
                "label": "查看用户详情 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-user-operations-v2/describe-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-user-operations-v2/list-users-v2",
                "label": "查看用户列表 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-user-operations-v2/list-users-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-user-operations-v2/drop-user-v2",
                "label": "删除用户 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-user-operations-v2/drop-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-user-operations-v2/update-user-v2",
                "label": "更新用户 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-user-operations-v2/update-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-user-operations-v2/grant-role-to-user-v2",
                "label": "授予用户角色 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-user-operations-v2/grant-role-to-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/cluster-user-operations-v2/revoke-role-from-user-v2",
                "label": "撤销用户角色 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/cluster-user-operations-v2/revoke-role-from-user-v2"
              }
            ]
          },
          {
            "type": "category",
            "label": "Privilege Group Operations (V2)",
            "key": "category:v2/data-plane-v2/privilege-group-operations-v2",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/create-privilege-group-v2",
                "label": "创建权限组 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/create-privilege-group-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/drop-privilege-group-v2",
                "label": "删除权限组 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/drop-privilege-group-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/list-privilege-groups-v2",
                "label": "列出权限组 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/list-privilege-groups-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/add-privileges-to-group-v2",
                "label": "向权限组添加权限 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/add-privileges-to-group-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/remove-privileges-from-group-v2",
                "label": "从权限组移除权限 (V2)",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/remove-privileges-from-group-v2"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "type": "category",
    "label": "V1",
    "key": "category:v1",
    "items": [
      {
        "type": "category",
        "label": "Control Plane (V1)",
        "key": "category:v1/control-plane-v1",
        "items": [
          {
            "type": "category",
            "label": "Import Operations (V1)",
            "key": "category:v1/control-plane-v1/import-operations",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/import-operations/import",
                "label": "导入 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/import-operations/import"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/import-operations/get-import-progress",
                "label": "查看导入进度 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/import-operations/get-import-progress"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/import-operations/list-import-jobs",
                "label": "查看导入任务列表 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/import-operations/list-import-jobs"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cloud Meta (V1)",
            "key": "category:v1/control-plane-v1/cloud-meta",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cloud-meta/list-cloud-providers",
                "label": "查看云服务提供商 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cloud-meta/list-cloud-providers"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cloud-meta/list-cloud-regions",
                "label": "查看云服务区域 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cloud-meta/list-cloud-regions"
              }
            ]
          },
          {
            "type": "category",
            "label": "Cluster Operations (V1)",
            "key": "category:v1/control-plane-v1/cluster-operations",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/list-clusters",
                "label": "查看集群列表 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/list-clusters"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/query-metrics",
                "label": "查看集群指标 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/query-metrics"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/create-cluster",
                "label": "创建集群 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/create-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/describe-cluster",
                "label": "查看集群详情 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/describe-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/drop-cluster",
                "label": "删除集群 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/drop-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/modify-cluster",
                "label": "修改集群配置 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/modify-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/resume-cluster",
                "label": "恢复集群 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/resume-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/suspend-cluster",
                "label": "挂起集群 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/suspend-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/create-serverless-cluster",
                "label": "创建 Serverless 集群 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/create-serverless-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/list-projects",
                "label": "查看项目列表 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/list-projects"
              }
            ]
          },
          {
            "type": "category",
            "label": "Pipeline Operations (V1)",
            "key": "category:v1/control-plane-v1/pipeline-operations",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/describe-pipeline",
                "label": "查看 Pipeline 详情 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/describe-pipeline"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/drop-pipeline",
                "label": "删除 Pipeline (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/drop-pipeline"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/create-pipeline",
                "label": "创建 Pipeline (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/create-pipeline"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/list-pipelines",
                "label": "查看 Pipeline 列表 (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/list-pipelines"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/run-pipeline",
                "label": "运行 Pipeline (V1)",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/run-pipeline"
              }
            ]
          }
        ]
      },
      {
        "type": "category",
        "label": "Data Plane (V1)",
        "key": "category:v1/data-plane-v1",
        "items": [
          {
            "type": "category",
            "label": "Collection Operations (V1)",
            "key": "category:v1/data-plane-v1/collection-operations",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/list-collections",
                "label": "查看 Collection 列表 (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/list-collections"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/create-collection",
                "label": "创建 Collection (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/create-collection"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/describe-collection",
                "label": "查看 Collection 详情 (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/describe-collection"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/drop-collection",
                "label": "删除 Collection (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/drop-collection"
              }
            ]
          },
          {
            "type": "category",
            "label": "Vector Operations (V1)",
            "key": "category:v1/data-plane-v1/vector-operations",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/delete",
                "label": "删除 Entity (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/delete"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/insert",
                "label": "插入 Entity (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/insert"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/upsert",
                "label": "Upsert (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/upsert"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/search",
                "label": "搜索 (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/search"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/query",
                "label": "查询 (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/query"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/get",
                "label": "获取 Entity (V1)",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/get"
              }
            ]
          }
        ]
      }
    ]
  }
]
