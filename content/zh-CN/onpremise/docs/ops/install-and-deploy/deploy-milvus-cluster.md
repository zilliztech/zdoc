---
title: "部署 Milvus 集群 | On-Premise"
slug: /deploy-milvus-cluster
sidebar_label: "部署 Milvus 集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本节将介绍在完成 Milvus Operator 安装后如何部署 Milvus 集群，包括如何规划 Milvus 集群资源、准备 Milvus 集群部署声明文件以及如何部署 Milvus 集群。 | On-Premise"
type: origin
token: J71GwWQZpijwEDkcD3ycczZOnXg
sidebar_position: 2
keywords: 
  - 向量数据库
  - 私有部署
  - milvus
  - 大模型向量数据库
  - 部署运维手册
  - 部署 milvus 集群
displayed_sidebar: onPremiseSidebar

---

<head>
  <meta name="robots" content="noindex" />
</head>


import Admonition from '@theme/Admonition';


# 部署 Milvus 集群

本节将介绍在完成 Milvus Operator 安装后如何部署 Milvus 集群，包括如何规划 Milvus 集群资源、准备 Milvus 集群部署声明文件以及如何部署 Milvus 集群。

## 前提条件\{#prerequisites}

在部署 Milvus 集群前，请确认您已经成功安装 Milvus Operator。如需安装 Milvus Operator，请参考[安装 Milvus Operator](./install-milvus-operator)。

## 规划 Milvus 集群资源\{#plan-resources-for-milvus-cluster}

本节以 3 台 16 vCPU 64 GiB 主机组成的 Kubernetes 为例介绍如何规划 Milvus 集群资源。

### 可用资源\{#applicable-resources}

每台机器需要为 Kubernetes 集群基础设施预留部分资源，剩余部分可供 Milvus 集群使用。 

<table>
   <tr>
     <th></th>
     <th><p>主机规格</p></th>
     <th><p>Kubernetes 基础设施</p></th>
     <th><p>Milvus 集群</p></th>
   </tr>
   <tr>
     <td><p>Master Node</p></td>
     <td><p>16 vCPU 64 GiB</p></td>
     <td><p>16 vCPU 64 GiB</p></td>
     <td><p>15 vCPU 56 GiB</p></td>
   </tr>
   <tr>
     <td><p>Worker Node 1</p></td>
     <td><p>16 vCPU 64 GiB</p></td>
     <td><p>16 vCPU 64 GiB</p></td>
     <td><p>15 vCPU 56 GiB</p></td>
   </tr>
   <tr>
     <td><p>Worker Node 2</p></td>
     <td><p>16 vCPU 64 GiB</p></td>
     <td><p>16 vCPU 64 GiB</p></td>
     <td><p>15 vCPU 56 GiB</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>合计</strong></p></td>
     <td><p><strong>45 vCPU 168 GiB</strong></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>推荐 Kubernetes 集群中的主机数量为奇数。</p>

</Admonition>

### Milvus 集群各组件资源分配\{#allocate-resources}

在为 Milvus 集群各组件分配资源时，需要考虑各组件运行时资源消耗和数据导入时资源消耗。

<table>
   <tr>
     <th><p>组件</p></th>
     <th><p>CPU</p></th>
     <th><p>Memory</p></th>
     <th><p>平时运行</p><p>建议数量</p></th>
     <th><p>数据导入（只写入，无查询）时</p><p>建议数量</p></th>
   </tr>
   <tr>
     <td><p>queryNode</p></td>
     <td><p>9</p></td>
     <td><p>40Gi</p></td>
     <td><p>3</p></td>
     <td><p>0</p></td>
   </tr>
   <tr>
     <td><p>dataNode</p></td>
     <td><p>4</p></td>
     <td><p>8Gi</p></td>
     <td><p>1</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>indexNode</p></td>
     <td><p>4</p></td>
     <td><p>8Gi</p></td>
     <td><p>1</p></td>
     <td><p>8</p></td>
   </tr>
   <tr>
     <td><p>mixCoord</p></td>
     <td><p>2</p></td>
     <td><p>4Gi</p></td>
     <td><p>2</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>proxy</p></td>
     <td><p>2</p></td>
     <td><p>8Gi</p></td>
     <td><p>2</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>etcd</p></td>
     <td><p>1</p></td>
     <td><p>4Gi</p></td>
     <td><p>3</p></td>
     <td><p>3</p></td>
   </tr>
   <tr>
     <td><p>pulsar-proxy</p></td>
     <td><p>0.5</p></td>
     <td><p>1Gi</p></td>
     <td><p>2</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>pulsar-broker</p></td>
     <td><p>0.5</p></td>
     <td><p>2Gi</p></td>
     <td><p>2</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>pulsar-bookie</p></td>
     <td><p>0.5</p></td>
     <td><p>2Gi</p></td>
     <td><p>3</p></td>
     <td><p>3</p></td>
   </tr>
   <tr>
     <td><p>pulsar-zookeeper</p></td>
     <td><p>0.2</p></td>
     <td><p>256MB</p></td>
     <td></td>
     <td><p>3</p></td>
   </tr>
</table>

[1] 此处仅考虑只写入无查询时的资源消耗情况。

## 部署 Milvus 集群\{#deploy-milvus-cluster}

### 准备 Milvus 集群部署声明文件\{#prepare-milvus-manifest}

在规划好 Milvus 集群所需资源后，还需要按如下模板中的注释修改 Milvus 集群部署声明文件，并将修改后的内容保存为`milvus-manifest.yaml`。

```yaml
apiVersion: milvus.io/v1beta1
kind: Milvus
metadata:
  # 用来milvus部署的namespace，一般由k8s管理员指定
  namespace: default 
  # 实例的部署名字
  name: "my-release"
spec:
  # 部署模式，一般为cluster
  mode: cluster
  components: 
    # milvus镜像，修改成自己的镜像地址
    image: userns/milvus-enterprise:v2.4.11
    # 是否开启滚动升级功能
    enableRollingUpdate: true
    # 以父子进程方式启动，支持优雅退出
    runWithSubProcess: true
    # 更新配置默认不重启，用于支持动态配置更新
    updateConfigMapOnly: true

    # ---配置环境变量----
    env: 
    - name: MILVUS_LICENSE_INFO # 配置License，由zilliz提供value
      value: 4433732b5f4025af155890ffae9a56b5A00CHJbKapyBNqbrvu6q02l80j2PrFrz5TEol7i/phUr/7sigtE5IVtq/N9rIJ72fibMoo3I9+r9Jqy+xLcpJMdfBUOlM5MUe2NjHJqjvl7pGeFjv4xF/TNLJycPMvR/vn+++uPa5nTP/NvvHXwCz5giDNk6vz42/+WoUnPHrHNTqGI=5108NV1gOH4QKwGtG7H0QB4sRoswVPWeQ4LEIFFdYc+hkpbgTfwPJN5G54O3zS0vzSGqGJo26h5gDLM9lJIAgGXcbLH0/exVyOKp5vMTYHOnRRjG4OD3LPHyv5RqFIVUwisTRV+f7UtMXEDOT7ipna6RoPW9rji4J7y+KtJAs5ULSTJBa9Ue3Crk25Mt4bxKpV2xPj/cbisUQ2mObggHi36+Mv+XOs6STj+8/gih7lRGIHbB+UrAtYzJY5PBj9CdlUszn2e1//wBDtHyvhykq80zNpARkuiyr3sMFq6DZbcjVCUlzLepZdUvGxY7dhX4infBx+4wtLMqnu383ZeMvlc5VA==LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcUFMTENTZEpneEdFenRkTVhudXoKU1c2WjVxMHdiNzUwRTkwTDZYSnlpeXV5b1lDdUkxQnhtZjViL2xkRDZBTndpZ2MreUJPVGk1UVBCNzAweWtZZAplck4yaUpIZ2VNWmZ0clpyV3FwMU5QWHJVbi85K3YrWFJuVUp3akRNWFlidzdiYVoxWTNnRkttckFDMXVFKzR5CnJUU0h6S1NvQ1VYY3JPWGU4bzYxdlRCVllNQ1BuOGpWcGJNcEloMGNFZDBmZ2RpVDZQNHNKNDJEWTNPcGtSM3oKeSt5YldwekEzWWt2a3FDWjIxNlhHYU41V2lQM1h3bUNlTC9OZnRsTGw3N2ZOWEcrOUl3M2dlOUVyRlZVaHRTVQorN0lpQmp6NTlKRDhQTzh5VytNYWthTlkyNEdORERSYUI5WlhMeWV6aDUzQkVEcjlnblh0OEdKUTNKY1NzeTgrCkx3SURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K
    - name: POD_NAME # 根据pod的名字生成POD_NAME环境变量
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.name
    # 根据需要可以添加更多环境变量
    # ---配置环境变量 end----
    
    # ---配置k8s的pod调度参数，一般由k8s管理员指定----
    nodeSelector: 
      node.wcs.io/networkArea: "SF"
    affinity:
      nodeAffinity:
        requiredDuringSchedulingIgnoredDuringExecution:
          nodeSelectorTerms:
          - matchExpressions:
            - key: node.wcs.io/idc
              operator: In
              values:
              - uat
            - key: app.wcs.io/zone
              operator: In
              values:
              - tctp
    # ---配置k8s的pod调度参数 end----

    # ---milvus的proxy组件配置---
    proxy:
      replicas: 2 # 副本数量
      resources: # 资源规格
        limits:
          cpu: 2
          memory: 8Gi
      # k8s service 类型 请根据实际环境设置，如果需要集群外访问可以选择LoadBalancer
      serviceType: ClusterIP
    # ---milvus的proxy组件配置 end---

    # ---milvus的dataNode组件配置---
    dataNode:
      replicas: 1 # 副本数量
      resources: # 资源规格
        limits:
          cpu: 4
          memory: 8Gi
    # ---milvus的dataNode组件配置 end---
 
    # ---milvus的indexNode组件配置---
    indexNode:
      replicas: 1 # 副本数量
      resources: # 资源规格
        limits:
          cpu: 4
          memory: 8Gi
    # ---milvus的indexNode组件配置 end---

    # ---milvus的queryNode组件配置---
    queryNode:
      replicas: 3 # 副本数量
      resources: # 资源规格
        limits:
          cpu: 9
          memory: 40Gi
    # ---milvus的queryNode组件配置 end---

    # ---milvus的mixCoord组件配置---
    mixCoord:
      replicas: 2 # 副本数量
      resources: # 资源规格
        limits:
          cpu: 2
          memory: 8Gi
    # ---milvus的mixCoord组件配置 end---

    # ---自定义额外的卷和挂卷信息---
    volumes: #k8s
    - name: wcs-logs-dir # 定义主机日志目录卷
      hostpath: 
        path: /data/logs/
        type: DirectoryOrCreate
    volumeMounts:
    - name: wcs-logs-dir # 挂载主机日志目录卷
      mountPath: /logs
      subPathExpr: $(POD_NAME)
    # ---自定义额外的卷和挂卷信息 end---

  # ---milvus的配置文件---
  config:
    # ref: https://milvus.io/docs/configure_log.md
    log: # 日志配置
      level: info #日志等级 debug, info, warn, error, fatal
      file:
        maxSize: 300
        rootPath: /logs/$(POD_NAME) #日志目录
    common: # 通用配置
      storageType: remote # 存储类型，远程对象存储
      security:
        authorizationEnabled: true
    minio: # 对象存储参数
      bucketName: milvus-bucket # milvus存储数据的bucket
      rootPath: milvus/my-release # milvus存储文件在bucket中的目录
      useSSL: true # 访问支持开启ssl
  # ---milvus的配置文件 end---

  # milvus的依赖配置
  dependencies:
    # ---对象存储连接信息---
    storage: 
      external: true # 是否为自己外部部署，false会采用milvus-operator部署的minio
      type: S3 # 对象存储类型， 一般为S3，还支持 MinIO 和 Azure
      endpoint: s3.amazonaws.com:443 # 对象存储地址，注意要指定端口
      secretRef: "my-release-s3-secret" # 保存对象存储accessKey密钥的secret资源名
    # ---对象存储连接信息 end---

    # ---etcd部署信息---
    etcd:
      external: false # 是否为自己外部部署，false会采用milvus-operator部署的etcd
      inCluster:
        values: # 额外配置参数
          replicaCount: 3 #etcd初始化副本数
          resources: #etcd初始化规格
            limits:
              cpu: 1
              memory: 4Gi
        deletionPolicy: Delete # 实例删除时的对etcd的保留策略，支持Delete / Retain 
        pvcDeletion: true # etcd被删除时是否删除响应数据卷（注意误删后无法恢复，生产一般为false，测试环境防止资源泄漏一般为true)
    # ---etcd部署信息 end---
    
    # ---消息队列部署信息---
    messageStreamType: pulsar # 消息队列类型
    pulsar:
      external: false # 是否为自己外部部署，false会采用milvus-operator部署的pulsar
      inCluster:
        values: {} # 额外配置参数，不写采用默认推荐值
        chartVersion: pulsar-v3 # pulsar的版本，支持pulsar-v2和pulsar-v3，建议采用pulsar-v3
        deletionPolicy: Delete # 实例删除时的对pulsar的保留策略，支持Delete / Retain 
        pvcDeletion: true # pulsar被删除时是否删除响应数据卷（注意误删后无法恢复，生产一般为false，测试环境防止资源泄漏一般为true)
    # ---消息队列部署信息 end---
---
apiVersion: v1
kind: Secret
metadata:
  name: my-release-s3-secret # 保存对象存储accessKey密钥的secret资源，注意和前面的secretRef对应
type: Opaque
stringData:
  accessKey: "ak" # 替换成accessKey
  secretKey: "sk" # 替换成secretKey
```

### 应用 Milvus 集群部署声明文件\{#apply-milvus-manifest}

在准备好 Milvus 集群部署声明文件后，执行如下命令开始部署 Milvus 集群。

```bash
# add-command-prompt
kubectl apply -f milvus-manifest.yaml
```

<Admonition type="info" icon="📘" title="说明">

<p>Milvus 集群的部署由 License 控制。在执行上述命令时，如果填入的 License 信息正确，可以在命令回显中看到<code>Success check license</code>。</p>

</Admonition>

## 部署后验证\{#verfication-afterwards}

1. 在部署完成后，可执行如下命令检查 Milvus 集群的部署状态。

    ```bash
    # add-command-prompt
    kubectl get milvus
    
    # output-start
    NAME         MODE      STATUS    UPDATED   AGE
    my-release   cluster   Healthy   True      14m
    # output-end
    ```

    正常情况下，Milvus 集群的 **STATUS** 应为 **Healthy**，同时 **UPDATED** 应为 **True**。如果 Milvus 集群状态不正常，可参考[常见问题](./deploy-milvus-cluster#faqs)。

1. 创建端口转发（port-foward）到 Milvus 集群上验证 Milvus 集群是否正常启动。

    ```bash
    # add-command-prompt
    export NAMESPACE="default"
    # add-command-prompt
    export NAME="my-release"
    
    # add-command-prompt
    kubectl -n $NAMESPACE port-forward service/$NAME-milvus 19530:19530 &
    
    # output-start
    Forwarding from 127.0.0.1:19530 -> 19530
    Forwarding from [::1]:19530 -> 19530
    # output-end
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>上述命令会在后台执行端口转发。关闭当前 Shell 会话后，端口转发仍保持生效状态。如该操作不符合预期，可删除<code>kubectl port-foward</code>命令后的 <code>&amp;</code> 符号，让端口转发随当前 Shell 会话结束。</p>

    </Admonition>

1. 使用 RESTful 接口访问 Milvus 集群。

    ```bash
    # add-command-prompt
    curl -X POST localhost:19530/v2/vectordb/collections/list
    
    # output-next-line
    { "code": 0, "data": [] }
    ```

1. 使用 PyMilvus 验证 Milvus 集群基本功能是否正常。

    1. 安装 PyMilvus。

        如下命令中使用 `2.4.6` 作为示例，请将其替换成 [PyMilvus 最新的版本号](https://github.com/milvus-io/pymilvus/releases)。

        ```bash
        # add-command-prompt
        python3 -m pip install pymilvus==2.4.6
        ```

    1. 下载验证代码。

        ```bash
        # add-command-prompt
        wget https://raw.githubusercontent.com/milvus-io/pymilvus/master/examples/hello_milvus.py
        ```

    1. 执行验证代码。

        ```bash
        # 修改connections.connect这行代码，添加认证参数user="root",password="Milvus"
        
        # add-command-prompt
        python3 hello_milvus.py
        # add-command-prompt
        echo "error_code: $?"
        
        # ouptut-next-line
        error_code: 0
        ```

        如果执行正常，命令回显中应该没有任何报错信息，且最后一行输出为 `error_code: 0`。

## 常见问题\{#faqs}

1. Milvus 集群服务状态为 Pending/Unhealthy，应该如何处理？

    当 Milvus 集群服务状态为 Pending 时，表明 Milvus 集群正在启动中。

    当 Milvus 集群服务状态为 Unhealthy 或长期处于 Pending 时，可执行如下步骤定位原因。

    1. 获取 Milvus 集群各依赖组件的状态。

        ```bash
        # add-command-prompt
        kubectl get milvus \
           -o custom-columns="etcd:.status.conditions[0].reason\
            ,objectStorage:.status.conditions[1].reason\
            ,pulsar:.status.conditions[2].reason\
            ,milvus:.status.conditions[3].reason"
        ```

        例如，下面的返回的结果，则表明 etcd 组件异常，需要进一步检查。

        ```bash
        # output-start
        etcd           objectStorage   pulsar           milvus
        EtcdNotReady   StorageReady    MsgStreamReady   MilvusComponentNotHealthy
        # output-end
        ```

    1. 获取各依赖组件异常的具体原因。

        ```bash
        # add-command-prompt
        kubectl get milvus \
           -o custom-columns="etcd:.status.conditions[0].message\
            ,objectStorage:.status.conditions[1].message\
            ,pulsar:.status.conditions[2].message\
            ,milvus:.status.conditions[3].message"
        ```

        比如，返回的结果如下，表明 etcd 连接失败。此时，可申请 Zilliz 支持团队介入排查 etcd 异常原因。

        ```bash
        etcd
        All etcd endpoints are unhealthy:[my-release-etcd.etcd.svc.cluster.local:2379:checkEtcd
                with backoff failed: context deadline exceeded]
        ```

        再比如下面例子是资源不足，querynode调度失败:

        ```shell
        milvus
        [querynode] not ready, detail: component[querynode]: pod[my-release-milvus-querynode-0-66f8c8b49f-tqrsx]:
                status[PodScheduled:False]: reason[Unschedulable]: 0/60 nodes are available:
                20 Insufficient cpu, 40 node(s) didn''t match Pod''s node affinity/selector.
                preemption: 0/60 nodes are available: 20 No preemption victims found for incoming
                pod, 40 Preemption is not helpful for scheduling..
        # ot
        ```

        再比如下面例子是querynode 内存耗尽导致被oom kill 而重启

        ```shell
        milvus
        [querynode] not ready, detail: component[querynode]: 
          pod[in01-cd5d8b22e7b6ad5-milvus-standalone-6fb5dcb49d-vt84r]:
            container[querynode]: restartCount[1] lastState[terminated] reason[OOMKilled]
        ```

        ```bash
        # add-command-prompt
        kubectl get milvus \
           -o custom-columns="etcd:.status.conditions[0].message\
            ,objectStorage:.status.conditions[1].message\
            ,pulsar:.status.conditions[2].message\
            ,milvus:.status.conditions[3].message"
        ```

        比如，返回的结果如下，表明 etcd 连接失败。此时，可申请 Zilliz 支持团队介入排查 etcd 异常原因。

        ```shell
        etcd
        All etcd endpoints are unhealthy:[my-release-etcd.etcd.svc.cluster.local:2379:checkEtcd
                with backoff failed: context deadline exceeded]
        ```

          如您无法确定异常的原因，请将返回的结果发送给zilliz侧的技术支持。