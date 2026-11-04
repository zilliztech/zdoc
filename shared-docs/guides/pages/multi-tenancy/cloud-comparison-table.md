|  | **Database-level** | **Collection-level** | **Partition-level** | **Partition key-level** |
| --- | --- | --- | --- | --- |
| **Cluster deployment option** | Dedicated only | All deployment options | All deployment options | All deployment options |
| **Data Isolation** | Physical | Physical | Physical | Physical + Logical |
| **Max. number of tenants** | 1,024 | Up to 16,384 depending on the cluster deployment option and project plan.<br/>See [Zilliz Cloud Limits](limitations.md) | Up to 1,024 per collection depending on the cluster deployment option and project plan.<br/>See [Zilliz Cloud Limits](limitations.md) | Millions |
| **Data schema flexibility** | High | Medium | Low | Low |
| **RBAC support** | Yes | Yes | No | No |
| **Search performance** | Strong | Strong | Medium | Medium |
| **Cross-tenant search support** | No | No | Yes | Yes |
| **Support for effective handling of hot and cold data** | Yes | Yes | Yes | No<br/>Currently, not supported for the partition key-level strategy. But if you have massive tenants and require effective handling of hot and cold data, please [contact us](https://zilliz.com/contact-sales). |
