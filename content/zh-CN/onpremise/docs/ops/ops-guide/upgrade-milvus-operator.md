---
title: "升级 Milvus Operator | On-Premise"
slug: /upgrade-milvus-operator
sidebar_label: "升级 Milvus Operator"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Milvus Operator 是一种可帮助您在目标 Kubernetes 集群上部署和管理包括所有 Milvus 组件和相关依赖项的 Milvus 服务栈的解决方案。本节将介绍如何升级 Milvus Operator。 | On-Premise"
type: origin
token: Jne5wmrpOiiaPMkbQOlcZKRyn7g
sidebar_position: 1
keywords: 
  - 向量数据库
  - 私有部署
  - milvus
  - 大模型向量数据库
  - 部署运维手册
  - 升级 Milvus Operator
displayed_sidebar: onPremiseSidebar

---

<head>
  <meta name="robots" content="noindex" />
</head>


import Admonition from '@theme/Admonition';


# 升级 Milvus Operator

Milvus Operator 是一种可帮助您在目标 Kubernetes 集群上部署和管理包括所有 Milvus 组件和相关依赖项的 Milvus 服务栈的解决方案。本节将介绍如何升级 Milvus Operator。

## 操作步骤\{#procedures}

您可按照如下步骤升级 Milvus Operator。

1. 检查您的 Kubernetes 集群中安装的 Milvus Operator 状态，是否正常running。

    ```bash
    # add-command-prompt
    kubectl -n milvus-operator get pods
    
    NAME                              READY   STATUS      RESTARTS       AGE
    milvus-operator-5fd77b87dc-msrk4  1/1     Running     0              30m
    ```

1. 确定要升级的版本，进行升级，以升级到v1.0.8为例。

    ```bash
    # add-command-prompt
    export version=v1.0.8
    # add-command-prompt
    kubectl apply -f https://github.com/zilliztech/milvus-operator/releases/download/${version}/deployment-no-webhook.yaml
    ```

1. 观察集群内 pod 的情况。

    ```bash
    # add-command-prompt
    kubectl -n milvus-operator get pods
    ```

    集群内的 pod 大致会经历如下三个阶段：

    - 新 Milvus Operator pod 初始化并启动。此时，上述命令返回

        ```shell
        NAME                              READY   STATUS      RESTARTS       AGE
        milvus-operator-5fd77b87dc-msrk4  1/1     Running     0              30m
        milvus-operator-bc87b8675-vbq7r   1/1     Running     0              15s
        ```

    - 旧 Milvus Operator pod 开始下线，进入 Terminating 状态。此时，上述命令返回

        ```shell
        NAME                              READY   STATUS      RESTARTS       AGE
        milvus-operator-5fd77b87dc-msrk4  1/1     Terminating 0              31m
        milvus-operator-bc87b8675-vbq7r   1/1     Running     0              83s
        ```

    - 仅剩下新  Milvus Operator pod 时，上述命令返回。

        ```shell
        NAME                              READY   STATUS      RESTARTS       AGE
        milvus-operator-bc87b8675-vbq7r   1/1     Running     0              1m24s
        ```

## 常见问题

可参考安装 Milvus Operator 时的[常见问题](./install-milvus-operator#faqs)。