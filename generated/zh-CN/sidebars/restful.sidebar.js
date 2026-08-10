module.exports = [
  {
    "type": "doc",
    "id": "api/restful/restful/restful",
    "label": "RESTful API 参考"
  },
  {
    "type": "category",
    "label": "V2",
    "items": [
      {
        "type": "category",
        "label": "控制平面（V2）",
        "items": [
          {
            "type": "category",
            "label": "导入操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/import-operations-v2/create-import-jobs-v2",
                "label": "创建导入任务（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/import-operations-v2/create-import-jobs-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/import-operations-v2/list-import-jobs-v2",
                "label": "列出导入作业（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/import-operations-v2/list-import-jobs-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/import-operations-v2/get-import-job-progress-v2",
                "label": "获取导入任务进度（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/import-operations-v2/get-import-job-progress-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/import-operations-v2"
          },
          {
            "type": "category",
            "label": "Cloud Meta（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-providers-v2",
                "label": "列出云服务提供商（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-providers-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-regions-v2",
                "label": "列出云区域（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-meta-v2/list-cloud-regions-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/cloud-meta-v2"
          },
          {
            "type": "category",
            "label": "提取、加载和转换（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/extract-load-and-transform-v2/merge-data-v2",
                "label": "合并数据（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/extract-load-and-transform-v2/merge-data-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/extract-load-transform-v2"
          },
          {
            "type": "category",
            "label": "卷操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/list-volumes-v2",
                "label": "列出卷（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/list-volumes-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/create-volume-v2",
                "label": "创建卷（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/create-volume-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/volume-operations-v2/delete-volume-v2",
                "label": "删除卷（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/volume-operations-v2/delete-volume-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/volume-operations-v2"
          },
          {
            "type": "category",
            "label": "项目操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/list-projects-v2",
                "label": "列出项目（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/list-projects-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/create-project-v2",
                "label": "创建项目（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/create-project-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/describe-project-v2",
                "label": "描述项目（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/describe-project-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2",
                "label": "升级项目（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/project-operations-v2/add-project-region-v2",
                "label": "添加项目区域（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/project-operations-v2/add-project-region-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/project-operations-v2"
          },
          {
            "type": "category",
            "label": "集群操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/list-clusters-v2",
                "label": "列出集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/list-clusters-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/describe-cluster-v2",
                "label": "描述集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/describe-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/create-dedicated-cluster-v2",
                "label": "创建 Dedicated 集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/create-dedicated-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/create-serverless-cluster-v2",
                "label": "创建 Serverless 集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/create-serverless-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/create-free-cluster-v2",
                "label": "创建免费集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/create-free-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/drop-cluster-v2",
                "label": "删除集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/drop-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/suspend-cluster-v2",
                "label": "暂停集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/suspend-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/resume-cluster-v2",
                "label": "恢复集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/resume-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-v2",
                "label": "修改集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-replica-v2",
                "label": "修改 Cluster 副本数（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cluster-operations-v2/modify-cluster-replica-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/cluster-operations-v2"
          },
          {
            "type": "category",
            "label": "按需集群操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/list-on-demand-clusters-v2",
                "label": "列出按需集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/list-on-demand-clusters-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/delete-on-demand-cluster-v2",
                "label": "删除按需集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/delete-on-demand-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/create-on-demand-cluster-v2",
                "label": "创建按需集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/on-demand-cluster-operations-v2/create-on-demand-cluster-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/on-demand-cluster-operations-v2"
          },
          {
            "type": "category",
            "label": "Cloud Migration（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-new-dedicated-cluster-v2",
                "label": "迁移到新的 Dedicated 集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-new-dedicated-cluster-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-existing-cluster-v2",
                "label": "迁移到现有集群（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-migration-v2/migrate-to-existing-cluster-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/cloud-migration-v2"
          },
          {
            "type": "category",
            "label": "备份与恢复（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/list-backups-v2",
                "label": "列出备份（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/list-backups-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/describe-backup-v2",
                "label": "查看备份详情（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/describe-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/delete-backup-v2",
                "label": "删除备份（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/delete-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/export-backup-files-v2",
                "label": "导出备份文件（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/export-backup-files-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/create-backup-v2",
                "label": "创建备份（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/create-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/get-backup-policy-v2",
                "label": "获取备份策略（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/get-backup-policy-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/set-backup-policy-v2",
                "label": "设置备份策略（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/set-backup-policy-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-cluster-backup-v2",
                "label": "恢复集群备份（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-cluster-backup-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-collection-backup-v2",
                "label": "恢复 Collection 备份（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/backup-and-restore-v2/restore-collection-backup-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/backup-restore-v2"
          },
          {
            "type": "category",
            "label": "监控指标和告警（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/list-alert-rules-v2",
                "label": "列出告警规则（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/list-alert-rules-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/create-alert-rule-v2",
                "label": "创建告警规则（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/create-alert-rule-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/update-alert-rule-v2",
                "label": "更新告警规则（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/update-alert-rule-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/delete-alert-rule-v2",
                "label": "删除告警规则（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/delete-alert-rule-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/metrics-and-alerts-v2/query-cluster-metrics-v2",
                "label": "查询集群指标（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/metrics-and-alerts-v2/query-cluster-metrics-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/metrics-alerts-v2"
          },
          {
            "type": "category",
            "label": "Cloud Job (V2)",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/cloud-job-v2/describe-job-v2",
                "label": "查询作业（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/cloud-job-v2/describe-job-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/cloud-job-v2"
          },
          {
            "type": "category",
            "label": "发票（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/invoices-v2/list-invoices-v2",
                "label": "列出发票（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/invoices-v2/list-invoices-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/invoices-v2/describe-invoice-v2",
                "label": "查看发票（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/invoices-v2/describe-invoice-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/invoices-v2"
          },
          {
            "type": "category",
            "label": "使用情况（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/control-plane/usage-v2/query-daily-usage-v2",
                "label": "查询每日用量（V2）",
                "key": "doc:api/restful/restful/v2/control-plane/usage-v2/query-daily-usage-v2"
              }
            ],
            "key": "category:v2/control-plane-v2/usage-v2"
          }
        ],
        "key": "category:v2/control-plane-v2"
      },
      {
        "type": "category",
        "label": "数据平面（V2）",
        "items": [
          {
            "type": "category",
            "label": "向量操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/delete-v2",
                "label": "删除（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/delete-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/insert-v2",
                "label": "插入（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/insert-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/upsert-v2",
                "label": "Upsert（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/upsert-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/query-v2",
                "label": "查询（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/query-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/search-v2",
                "label": "搜索（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/search-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/hybrid-search-v2",
                "label": "混合搜索（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/hybrid-search-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/vector-operations-v2/get-v2",
                "label": "获取（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/vector-operations-v2/get-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/vector-operations-v2"
          },
          {
            "type": "category",
            "label": "Collection 操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/list-collections-v2",
                "label": "列出 Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/list-collections-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/create-collection-v2",
                "label": "创建 Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/create-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/flush-collection-v2",
                "label": "Flush Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/flush-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/compact-collection-v2",
                "label": "Compact Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/compact-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/get-compaction-state-v2",
                "label": "获取 Compaction 状态（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/get-compaction-state-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/describe-collection-v2",
                "label": "描述 Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/describe-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-v2",
                "label": "删除 Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/has-collection-v2",
                "label": "检查 Collection 是否存在（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/has-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-stats-v2",
                "label": "获取 Collection 统计信息（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-stats-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/refresh-load-v2",
                "label": "刷新加载（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/refresh-load-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/alter-collection-properties-v2",
                "label": "更改 Collection 属性（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/alter-collection-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-properties-v2",
                "label": "删除 Collection 属性（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/drop-collection-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/add-collection-field-v2",
                "label": "添加 Collection 字段（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/add-collection-field-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/alter-field-properties-v2",
                "label": "更改字段属性（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/alter-field-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/rename-collection-v2",
                "label": "重命名 Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/rename-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/load-collection-v2",
                "label": "加载 Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/load-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/release-collection-v2",
                "label": "释放 Collection（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/release-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-load-state-v2",
                "label": "获取 Collection 加载状态（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/get-collection-load-state-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/add-function-to-collection-v2",
                "label": "向 Collection 添加函数（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/add-function-to-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/alter-function-in-collection-v2",
                "label": "更改 Collection 中的函数（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/alter-function-in-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/drop-function-from-collection-v2",
                "label": "从 Collection 中删除函数（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/drop-function-from-collection-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/collection-operations-v2/run-analyzer-v2",
                "label": "运行 Analyzer（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/collection-operations-v2/run-analyzer-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/collection-operations-v2"
          },
          {
            "type": "category",
            "label": "Database 操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/create-database-v2",
                "label": "创建 Database（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/create-database-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/list-databases-v2",
                "label": "列出 Database（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/list-databases-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/describe-database-v2",
                "label": "描述 Database（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/describe-database-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/alter-database-properties-v2",
                "label": "更改 Database 属性（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/alter-database-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/drop-database-properties-v2",
                "label": "删除 Database 属性（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/drop-database-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/database-operations-v2/drop-database-v2",
                "label": "删除 Database（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/database-operations-v2/drop-database-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/database-operations-v2"
          },
          {
            "type": "category",
            "label": "索引操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/create-index-v2",
                "label": "创建索引（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/create-index-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/describe-index-v2",
                "label": "描述索引（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/describe-index-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/alter-index-properties-v2",
                "label": "更改索引属性（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/alter-index-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/drop-index-properties-v2",
                "label": "删除索引属性（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/drop-index-properties-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/drop-index-v2",
                "label": "删除索引（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/drop-index-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/index-operations-v2/list-indexes-v2",
                "label": "列出索引（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/index-operations-v2/list-indexes-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/index-operations-v2"
          },
          {
            "type": "category",
            "label": "Partition 操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/list-partitions-v2",
                "label": "列出 Partition（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/list-partitions-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/create-partition-v2",
                "label": "创建 Partition（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/create-partition-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/load-partitions-v2",
                "label": "加载 Partition（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/load-partitions-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/release-partitions-v2",
                "label": "释放 Partition（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/release-partitions-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/has-partition-v2",
                "label": "检查 Partition 是否存在（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/has-partition-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/get-partition-statistics-v2",
                "label": "获取 Partition 统计信息（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/get-partition-statistics-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/partition-operations-v2/drop-partition-v2",
                "label": "删除 Partition（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/partition-operations-v2/drop-partition-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/partition-operations-v2"
          },
          {
            "type": "category",
            "label": "角色操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/list-roles-v2",
                "label": "列出角色（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/list-roles-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/describe-role-v2",
                "label": "描述角色（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/describe-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/create-role-v2",
                "label": "创建角色（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/create-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/grant-privilege-to-role-v2",
                "label": "向角色授予权限（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/grant-privilege-to-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/revoke-privilege-from-role-v2",
                "label": "从角色中撤销权限（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/revoke-privilege-from-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/drop-role-v2",
                "label": "删除角色（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/drop-role-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/grant-privilege-to-role-v2-v2",
                "label": "向角色授予权限（V2）（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/grant-privilege-to-role-v2-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/role-operations-v2/revoke-privilege-from-role-v2-v2",
                "label": "从角色撤销权限（V2）（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/role-operations-v2/revoke-privilege-from-role-v2-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/role-operations-v2"
          },
          {
            "type": "category",
            "label": "别名操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/list-aliases-v2",
                "label": "列出别名（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/list-aliases-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/describe-alias-v2",
                "label": "描述别名（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/describe-alias-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/alter-alias-v2",
                "label": "修改别名（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/alter-alias-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/drop-alias-v2",
                "label": "删除别名（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/drop-alias-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/alias-operations-v2/create-alias-v2",
                "label": "创建别名（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/alias-operations-v2/create-alias-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/alias-operations-v2"
          },
          {
            "type": "category",
            "label": "用户操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/user-operations-v2/create-user-v2",
                "label": "创建用户（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/user-operations-v2/create-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/user-operations-v2/describe-user-v2",
                "label": "描述用户（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/user-operations-v2/describe-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/user-operations-v2/list-users-v2",
                "label": "列出用户（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/user-operations-v2/list-users-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/user-operations-v2/drop-user-v2",
                "label": "删除用户（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/user-operations-v2/drop-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/user-operations-v2/update-user-v2",
                "label": "更新用户（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/user-operations-v2/update-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/user-operations-v2/grant-role-to-user-v2",
                "label": "向用户授予角色（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/user-operations-v2/grant-role-to-user-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/user-operations-v2/revoke-role-from-user-v2",
                "label": "从用户中撤销角色（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/user-operations-v2/revoke-role-from-user-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/user-operations-v2"
          },
          {
            "type": "category",
            "label": "权限组操作（V2）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/create-privilege-group-v2",
                "label": "创建权限组（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/create-privilege-group-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/drop-privilege-group-v2",
                "label": "删除 Privilege Group（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/drop-privilege-group-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/list-privilege-groups-v2",
                "label": "列出权限组（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/list-privilege-groups-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/add-privileges-to-group-v2",
                "label": "向组添加权限（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/add-privileges-to-group-v2"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v2/data-plane/privilege-group-operations-v2/remove-privileges-from-group-v2",
                "label": "从组中移除权限（V2）",
                "key": "doc:api/restful/restful/v2/data-plane/privilege-group-operations-v2/remove-privileges-from-group-v2"
              }
            ],
            "key": "category:v2/data-plane-v2/privilege-group-operations-v2"
          }
        ],
        "key": "category:v2/data-plane-v2"
      }
    ],
    "key": "category:v2"
  },
  {
    "type": "category",
    "label": "V1",
    "items": [
      {
        "type": "category",
        "label": "控制平面（V1）",
        "items": [
          {
            "type": "category",
            "label": "导入操作（V1）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/import-operations/import",
                "label": "导入（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/import-operations/import"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/import-operations/get-import-progress",
                "label": "获取导入进度（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/import-operations/get-import-progress"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/import-operations/list-import-jobs",
                "label": "列出导入任务（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/import-operations/list-import-jobs"
              }
            ],
            "key": "category:v1/control-plane-v1/import-operations-v1"
          },
          {
            "type": "category",
            "label": "云元数据（V1）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cloud-meta/list-cloud-providers",
                "label": "列出云服务提供商（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cloud-meta/list-cloud-providers"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cloud-meta/list-cloud-regions",
                "label": "列出云区域（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cloud-meta/list-cloud-regions"
              }
            ],
            "key": "category:v1/control-plane-v1/cloud-meta-v1"
          },
          {
            "type": "category",
            "label": "集群操作（V1）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/list-clusters",
                "label": "列出集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/list-clusters"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/query-metrics",
                "label": "查询指标（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/query-metrics"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/create-cluster",
                "label": "创建集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/create-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/describe-cluster",
                "label": "描述集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/describe-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/drop-cluster",
                "label": "删除集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/drop-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/modify-cluster",
                "label": "修改集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/modify-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/resume-cluster",
                "label": "恢复集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/resume-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/suspend-cluster",
                "label": "暂停集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/suspend-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/create-serverless-cluster",
                "label": "创建 Serverless 集群（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/create-serverless-cluster"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/cluster-operations/list-projects",
                "label": "列出项目（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/cluster-operations/list-projects"
              }
            ],
            "key": "category:v1/control-plane-v1/cluster-operations-v1"
          },
          {
            "type": "category",
            "label": "管道操作（V1）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/describe-pipeline",
                "label": "描述 Pipeline（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/describe-pipeline"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/drop-pipeline",
                "label": "删除 Pipeline（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/drop-pipeline"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/create-pipeline",
                "label": "创建 Pipeline（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/create-pipeline"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/list-pipelines",
                "label": "列出流水线（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/list-pipelines"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/control-plane/pipeline-operations/run-pipeline",
                "label": "运行 Pipeline（V1）",
                "key": "doc:api/restful/restful/v1/control-plane/pipeline-operations/run-pipeline"
              }
            ],
            "key": "category:v1/control-plane-v1/pipeline-operations-v1"
          }
        ],
        "key": "category:v1/control-plane-v1"
      },
      {
        "type": "category",
        "label": "数据平面（V1）",
        "items": [
          {
            "type": "category",
            "label": "Collection 操作（V1）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/list-collections",
                "label": "列出 Collection（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/list-collections"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/create-collection",
                "label": "创建 Collection（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/create-collection"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/describe-collection",
                "label": "描述 Collection（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/describe-collection"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/collection-operations/drop-collection",
                "label": "删除 Collection（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/collection-operations/drop-collection"
              }
            ],
            "key": "category:v1/data-plane-v1/collection-operations-v1"
          },
          {
            "type": "category",
            "label": "向量操作（V1）",
            "items": [
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/delete",
                "label": "删除（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/delete"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/insert",
                "label": "插入（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/insert"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/upsert",
                "label": "Upsert（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/upsert"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/search",
                "label": "搜索（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/search"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/query",
                "label": "查询（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/query"
              },
              {
                "type": "doc",
                "id": "api/restful/restful/v1/data-plane/vector-operations/get",
                "label": "获取（V1）",
                "key": "doc:api/restful/restful/v1/data-plane/vector-operations/get"
              }
            ],
            "key": "category:v1/data-plane-v1/vector-operations-v1"
          }
        ],
        "key": "category:v1/data-plane-v1"
      }
    ],
    "key": "category:v1"
  }
]
