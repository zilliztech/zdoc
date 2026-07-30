---
title: "升级 Milvus 集群 | On-Premise"
slug: /upgrade-milvus-cluster
sidebar_label: "升级 Milvus 集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Milvus 集群支持通过 Kubernetes 的滚动更新能力对各组件进行滚动升级，从而在不停机的情况下，将 Milvus 集群更新到指定版本。本章将介绍如何进行升级前检查、执行升级和查看升级进度等操作的具体步骤。 | On-Premise"
type: origin
token: Mv9kwLJBNiXJpqkzDu6cw2MInAb
sidebar_position: 2
keywords: 
  - 向量数据库
  - 私有部署
  - milvus
  - 大模型向量数据库
  - 部署运维手册
  - 升级 Milvus 集群
displayed_sidebar: onPremiseSidebar

---

<head>
  <meta name="robots" content="noindex" />
</head>


import Admonition from '@theme/Admonition';


# 升级 Milvus 集群

Milvus 集群支持通过 [Kubernetes 的滚动更新](https://kubernetes.io/zh-cn/docs/tutorials/kubernetes-basics/update/update-intro/)能力对各组件进行滚动升级，从而在不停机的情况下，将 Milvus 集群更新到指定版本。本章将介绍如何进行升级前检查、执行升级和查看升级进度等操作的具体步骤。

## 升级前检查\{#checks-before-upgrade}

为了保证后续升级顺利进行，需要对当前 Milvus 集群的运行状态及 Milvus 集群的当前版本进行检查。如下示例假设 Milvus 集群部署在 **default** 命名空间中，Milvus 集群的名称为 **my-release**。

- 检查 Milvus 集群的运行状态。

    执行 `kubectl get milvus` 命令，并查看命令返回情况。

    ```bash
    # add-command-prompt
    kubectl get milvus
    
    # output-start
    NAME         MODE      STATUS    UPDATED   AGE
    my-release   cluster   Healthy   True      14m
    # output-end
    ```

    正常情况下，Milvus 集群的 **STATUS** 应为 **Healthy**，同时 **UPDATED** 应为 **True**。如果 Milvus 集群状态不正常，可参考[常见问题](./deploy-milvus-cluster#faqs)。

- 检查 Milvus 集群的当前版本。

    执行如下命令查看当前 Milvus 集群使用的镜像版本，并确保滚动升级功能已开启。

    ```bash
    # add-command-prompt
    kubectl get milvus -o\
      custom-columns='name:.metadata.name,image:.spec.components.image,\
      rollingUpdate:.spec.components.enableRollingUpdate'
    ```

    命令返回如下：

    ```shell
    name            image                                 rollingUpdate
    my-release      userns/milvus-enterprise:v2.4.11      true
    ```

    可以看到当前使用的镜像版本为 v2.4.11，并且已经开启了滚动升级功能。

## 执行升级\{#upgrade-milvus-cluster}

如下示例假设升级目标为 **userns/milvus-enterprise:v2.4.11**。您可以执行如下命令开始将 Milvus 集群升级到目标镜像。

```bash
# add-command-prompt
export INST="my-release"
# add-command-prompt
export IMAGE="userns/milvus-enterprise:v2.4.11"

# add-command-prompt
kubectl patch milvus $INST --type='json' \
      -p='[{"op": "replace", \
      "path": "/spec/components/image", \
      "value":"'$IMAGE'"}]'
```

在上述命令执行完成后，可以执行如下命令检查升级指令是否下发成功。

```bash
# add-command-prompt
kubectl get milvus -o\
      custom-columns='name:.metadata.name,image:.spec.components.image,\
      rollingUpdate:.spec.components.enableRollingUpdate'
```

命令返回应和如下类似：

```shell
name            image                                rollingUpdate
my-release      userns/milvus-enterprise:v2.4.11     true
```

## 查看升级进度\{#check-upgrade-progress}

您可通过如下命令查看Milvus 集群的详细升级进度。

```bash
# add-command-prompt
kubectl get milvus -o custom-columns="\
    name:.metadata.name,\
    updated:.status.conditions[4].status,\
    message:.status.conditions[4].message"
```

如下输出表示目前还有 DataNode 和 Proxy 等组件还在升级过程中。

```bash
name                  updated  message
in01-cd5d8b22e7b6ad5  False    Milvus components[datanode,proxy] are updating
```

在 Milvus 集群常规部署模式下，一共有 5 个组件，分别为 IndexNode、MixCoord、QueryNode、DataNode 和 Proxy。滚动升级会按照顺序逐个升级这些组件。升级完成后再次执行上面命令会看到如下输出：

```bash
name         updated       message
my-release   True          Milvus components are all updated
```

如升级过程中 Milvus 集群出现异常，可以参考[常见问题](./deploy-milvus-cluster#faqs)进行处理。