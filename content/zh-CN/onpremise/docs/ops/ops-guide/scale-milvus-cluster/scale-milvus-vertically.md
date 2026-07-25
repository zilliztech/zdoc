---
title: "Milvus 集群纵向扩缩容 | On-Premise"
slug: /scale-milvus-vertically
sidebar_label: "纵向扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "纵向扩缩容是指通过调整分配给 Milvus 集群各组件的资源规格对 Milvus 集群进行扩缩容。本节主要介绍如何对 Milvus 集群进行纵向扩缩容。 | On-Premise"
type: origin
token: SOmGw2d6einangkaspfcIFMTnBb
sidebar_position: 2
keywords: 
  - 向量数据库
  - 私有部署
  - milvus
  - 大模型向量数据库
  - 部署运维手册
  - milvus 集群纵向扩缩容
displayed_sidebar: onPremiseSidebar

---

<head>
  <meta name="robots" content="noindex" />
</head>


import Admonition from '@theme/Admonition';


# Milvus 集群纵向扩缩容

纵向扩缩容是指通过调整分配给 Milvus 集群各组件的资源规格对 Milvus 集群进行扩缩容。本节主要介绍如何对 Milvus 集群进行纵向扩缩容。

## 操作步骤\{#procedures}

您可以按照如下步骤对 Milvus 集群进行纵向扩缩容。

1. 确认 Milvus 集群当前各组件的资源规格。

    ```bash
    # add-command-prompt
    export COMPONENT="mixCoord"
    
    # add-command-prompt
    kubectl get milvus my-release -o \
       custom-columns="cpuRequests:spec.components.$COMPONENT.resources.requests.cpu\
       ,cpuLimits:spec.components.$COMPONENT.resources.limits.cpu\
       ,memoryRequests:spec.components.$COMPONENT.resources.requests.memory\
       ,memoryLimits:spec.components.$COMPONENT.resources.requests.memory"
    ```

    命令返回如下：

    ```shell
    cpuRequests   cpuLimits   memoryRequests   memoryLimits
    4             4           8Gi              8Gi
    ```

1. 执行扩缩容。

    如下示例以 MixCoord 为例，将分配给该组件的 **vCPU** 个数由 **4** 个调整为 **8** 个，**内存**由 **8 GiB** 调整为 **16 GiB**。

    ```bash
    # add-command-prompt
    export COMPONENT="mixCoord"
    # add-command-prompt
    export CPU="8"
    # add-command-prompt
    export MEMORY="16Gi"
    
    # add-command-prompt
    kubectl patch milvus my-release --type='json' \
       -p='[{"op": "replace", \
       "path": "/spec/components/'$COMPONENT'/resources/requests/cpu", \
       "value": '$CPU'},\
       {"op": "replace", \
       "path": "/spec/components/'$COMPONENT'/resources/limits/cpu", \
       "value": '$CPU'},\
       {"op": "replace", \
       "path": "/spec/components/'$COMPONENT'/resources/requests/memory", \
       "value": '$MEMORY'},\
       {"op": "replace", \
       "path": "/spec/components/'$COMPONENT'/resources/limits/memory", \
       "value": '$MEMORY'},\
       ]'
    ```

    执行上述命令后，可以通过如下命令查看扩容的目标数量。

    ```bash
    # add-command-prompt
    export COMPONENT="mixCoord"
    
    # add-command-prompt
    kubectl get milvus my-release -o \
       custom-columns="cpuRequests:spec.components.$COMPONENT.resources.requests.cpu\
       ,cpuLimits:spec.components.$COMPONENT.resources.limits.cpu\
       ,memoryRequests:spec.components.$COMPONENT.resources.requests.memory\
       ,memoryLimits:spec.components.$COMPONENT.resources.requests.memory"
    ```

    命令返回如下：

    ```shell
    cpuRequests   cpuLimits   memoryRequests   memoryLimits
    8             8           16Gi             16Gi
    ```

    <Admonition type="info" icon="📘" title="说明">

    <p>此时仅调整了扩容目标，扩缩容操作可能仍在进行中。</p>

    </Admonition>

1. 查看进度。

    执行如下命令可查看 Milvus 集群组件更新时使用的 Deployment。

    ```bash
    # add-command-prompt
    export COMPONENT="mixCoord"
    # add-command-prompt
    kubectl get deploy |grep  "NAME\|$COMPONENT"
    ```

    我们会看到类似如下的输出。

    ```shell
    NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
    my-release-milvus-mixcoord  3/2     2            3           5h20m
    ```

    其中，**UP-TO-DATE** 表明启动了 2 个新规格的 MixCoord Pod，而 **AVAILABLE** 表明现在有 3 个 MixCoord Pod在运行，包括一个待下线的旧规格的 MixCoord Pod。

    在升级完成后，最终会看到下面的状态。

    ```shell
    NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
    my-release-milvus-mixcoord  2/2     2            2           5h20m
    ```

    需要注意的是，QueryNode 的纵向扩容是轮流在两个 Deployment 中完成更新的。所以在查看 Deployment 时，可能会看到下面的状态。

    ```bash
    # add-command-prompt
    kubectl get deploy |grep  "NAME\|querynode"
    
    NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
    my-release-milvus-querynode-0   6/6     6            6           5h20m
    my-release-milvus-querynode-1   1/3     3            1           5h20m
    ```

    通过上面的回显可以看到，**my-release-milvus-querynode-0** 管理着所有旧规格的 QueryNode Pod。而在 **my-release-milvus-querynode-1** 中已经启动了 3 个新规格的 QueryNode Pod，其中 1 个 QueryNode Pod 已经准备就绪，还有 2 个在启动中。

    当 **my-release-milvus-querynode-1** 中的所有新规格 QueryNode Pod 都就绪后，**my-release-milvus-querynode-0** 中的旧规格 QueryNode Pod 开始下线。

    ```shell
    NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
    my-release-milvus-querynode-0   2/3     3            2           5h20m
    my-release-milvus-querynode-1   6/6     6            6           5h20m
    ```

    在旧规格 QueryNode Pod 全部下线后，扩容完成。

    ```shell
    NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
    my-release-milvus-querynode-0   0/0     0            0           5h20m
    my-release-milvus-querynode-1   6/6     6            6           5h20m
    ```

    在对 QueryNode 进行纵向扩缩容操作时，Kubernetes 会轮流使用这两个 Deployment 完成更新。