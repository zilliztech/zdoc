---
title: "FAQ：鉴权 | BYOC"
slug: /faq-authentication
sidebar_label: "FAQ：鉴权"
beta: FALSE
notebook: FALSE
description: "本文列举了在 Zilliz Cloud 鉴权时可能遇到的常见问题及对应解决方法。 | BYOC"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 10
displayed_sidebar: default

---

# FAQ：鉴权

本文列举了在 Zilliz Cloud 鉴权时可能遇到的常见问题及对应解决方法。

## Contents

- [如何解决连接时身份验证失败？](#what-can-i-do-if-i-forget-the-password-used-to-connect-to-my-zilliz-cloud-cluster)

## FAQs




在 BYOC 项目中，请使用目标集群的鉴权凭据（`username:password`）进行集群连接。

### 如何解决连接时身份验证失败？\{#what-can-i-do-if-i-forget-the-password-used-to-connect-to-my-zilliz-cloud-cluster}

请执行以下步骤解决连接时身份验证失败的问题：

1. 连接 Zilliz Cloud 集群时，请确保使用正确的用户名和密码。

1. 如忘记密码，请点击想要连接的集群并切换至 **Users** 选项卡。点击 **+ User** 以创建新用户和密码。

    ![add-cluster-user-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/add-cluster-user-cn.png "add-cluster-user-cn")
