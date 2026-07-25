---
title: "集群身份凭证 | Cloud"
slug: /cluster-credentials
sidebar_key: cluster-credentials
sidebar_label: "集群身份凭证"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 通过集群身份凭证或 API 密钥认证您的身份。本文将介绍如何使用集群身份凭证完成身份认证。 | Cloud"
type: origin
token: VNWiwtYwGi9m0Okhj3Zce8wAnte
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 集群
  - 凭证

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 集群身份凭证

Zilliz Cloud 通过集群身份凭证或 API 密钥认证您的身份。本文将介绍如何使用集群身份凭证完成身份认证。

在 Zilliz Cloud 中，集群身份凭证通常由一个使用半角冒号（:）连接的用户名及对应的密码组成，如`user:password`，用于认证及授权您对集群的交互请求。

当您设置集群时，Zilliz Cloud 会创建名为 `db_admin` 的集群默认集群用户，并授予其 **Admin** 角色，使其具有完整的集群访问权限。默认用户的密码仅会在集群创建时展示一次，请及时保存密码。

除了默认的用户 `db_admin` 外，您可以[创建](./cluster-users)更多用户。

## 重置用户密码\{#reset-the-password-of-a-cluster-user}

如果您遗忘了用户密码或怀疑密码遭到泄漏，可重置考虑密码。

- **通过控制台重置密码**

![reset-cluster-user-password-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/reset-cluster-user-password-zh.png "reset-cluster-user-password-zh")

- **通过编程重置密码**

    您可以通过在程序中调用 RESTful API 或 SDK 接口的方式重置指定用户的密码。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import MilvusClient
    client = MilvusClient(
        uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
        token="user:password"
    )
    
    client.update_password(
        user_name="user_1",
        old_password="P@ssw0rd",
        new_password="NewP@ssw0rd"
    )
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    UpdatePasswordReq updatePasswordReq = UpdatePasswordReq.builder()
            .userName("user_1")
            .password("P@ssw0rd")
            .newPassword("NewP@ssw0rd")
            .build();
    client.updatePassword(updatePasswordReq);
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    milvusClient.updateUser({
       username: 'user_1',
       newPassword: 'NewP@ssw0rd',
       oldPassword: 'P@ssw0rd',
     })
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import (
       "context"
       "google.golang.org/grpc"
       "github.com/milvus-io/milvus/v2/milvusclient"
    )
    
    userName := "user_1"
    oldpass := "P@ssw0rd"
    newpass := "NewP@ssw0rd"
    opts := client.NewUpdatePasswordOption(userName, oldpass, newpass)
    
    onFinish := func(ctx context.Context, err error) {
        if err != nil {
            fmt.Printf("gRPC call finished with error: %v\n", err)
        } else {
            fmt.Printf("gRPC call finished successfully")
        }
    }
    
    callOption := grpc.OnFinish(onFinish)
    
    err := mclient.UpdatePassword(context.Background(), opts, callOpts)
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/users/update_password" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "newPassword": "NewP@ssw0rd",
        "userName": "user_1",
        "password": "P@ssw0rd*"
    }'
    ```

    </TabItem>
    </Tabs>

