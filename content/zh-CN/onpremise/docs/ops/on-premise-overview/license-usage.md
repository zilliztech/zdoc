---
title: "License 管理 | On-Premise"
slug: /license-usage
sidebar_label: "License 管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Milvus 商业版镜像使用 Zilliz 自主开发的 Cardinal 内核，集成了 License 校验逻辑。启动时，需要您导入由 Zilliz 生成的 License 配置信息进行授权，否则 Milvus 实例将无法启动。 | On-Premise"
type: origin
token: R7guwJ0T0i0gRrkh5CZc5kDPnCh
sidebar_position: 3
keywords: 
  - 向量数据库
  - 私有部署
  - milvus
  - 大模型向量数据库
  - 部署运维手册
  - License 管理
displayed_sidebar: onPremiseSidebar

---

<head>
  <meta name="robots" content="noindex" />
</head>


import Admonition from '@theme/Admonition';


# License 管理

Milvus 商业版镜像使用 Zilliz 自主开发的 Cardinal 内核，集成了 License 校验逻辑。启动时，需要您导入由 Zilliz 生成的 License 配置信息进行授权，否则 Milvus 实例将无法启动。

## 配置 License 信息\{#configure-license-info}

您可以在部署前准备 Milvus 集群部署声明文件时写入 License 信息，也可以在 Milvus 集群部署完成后写入 License 信息。

在收到 Zilliz 生成的 License 信息后，将其填入 Milvus 集群部署声明文件中的 `spec.components.env` 字段内。

```yaml
spec:
  env:
    - name: MILVUS_LICENSE_INFO # 配置License，由zilliz提供value
      value: 4433732b5f4025af155890ffae9a56b5A00CHJbKapyBNqbrvu6q02l80j2PrFrz5TEol7i/phUr/7sigtE5IVtq/N9rIJ72fibMoo3I9+r9Jqy+xLcpJMdfBUOlM5MUe2NjHJqjvl7pGeFjv4xF/TNLJycPMvR/vn+++uPa5nTP/NvvHXwCz5giDNk6vz42/+WoUnPHrHNTqGI=5108NV1gOH4QKwGtG7H0QB4sRoswVPWeQ4LEIFFdYc+hkpbgTfwPJN5G54O3zS0vzSGqGJo26h5gDLM9lJIAgGXcbLH0/exVyOKp5vMTYHOnRRjG4OD3LPHyv5RqFIVUwisTRV+f7UtMXEDOT7ipna6RoPW9rji4J7y+KtJAs5ULSTJBa9Ue3Crk25Mt4bxKpV2xPj/cbisUQ2mObggHi36+Mv+XOs6STj+8/gih7lRGIHbB+UrAtYzJY5PBj9CdlUszn2e1//wBDtHyvhykq80zNpARkuiyr3sMFq6DZbcjVCUlzLepZdUvGxY7dhX4infBx+4wtLMqnu383ZeMvlc5VA==LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcUFMTENTZEpneEdFenRkTVhudXoKU1c2WjVxMHdiNzUwRTkwTDZYSnlpeXV5b1lDdUkxQnhtZjViL2xkRDZBTndpZ2MreUJPVGk1UVBCNzAweWtZZAplck4yaUpIZ2VNWmZ0clpyV3FwMU5QWHJVbi85K3YrWFJuVUp3akRNWFlidzdiYVoxWTNnRkttckFDMXVFKzR5CnJUU0h6S1NvQ1VYY3JPWGU4bzYxdlRCVllNQ1BuOGpWcGJNcEloMGNFZDBmZ2RpVDZQNHNKNDJEWTNPcGtSM3oKeSt5YldwekEzWWt2a3FDWjIxNlhHYU41V2lQM1h3bUNlTC9OZnRsTGw3N2ZOWEcrOUl3M2dlOUVyRlZVaHRTVQorN0lpQmp6NTlKRDhQTzh5VytNYWthTlkyNEdORERSYUI5WlhMeWV6aDUzQkVEcjlnblh0OEdKUTNKY1NzeTgrCkx3SURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K
```

关于 Milvus 集群部署声明文件的详细情况，可以查看[准备 Milvus 集群部署声明文件](./deploy-milvus-cluster#prepare-milvus-manifest)。

检查 Milvus 集群部署声明文件无误后，可[应用该声明文件](./deploy-milvus-cluster#apply-milvus-manifest)。具体操作及声明文件各参数含义，可参考[部署 Milvus 集群](./deploy-milvus-cluster)。

### 检查 License 信息\{#check-license-info}

当正确导入 License 配置后，启动 Milvus 镜像部署流程时会提示 `Success check license` 信息。

![DMpebCHp6o4tK6xfMT1cI5YanSb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/DMpebCHp6o4tK6xfMT1cI5YanSb.png)

License 中包含了过期时间信息。当 License 过期后 Milvus 实例将无法运行。此时，可以通过检查 Milvus 实例日志的方式查看到 License 过期提示信息。

![Es87bgPcEoffO9xr1UpcsHvtnAc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Es87bgPcEoffO9xr1UpcsHvtnAc.png)

