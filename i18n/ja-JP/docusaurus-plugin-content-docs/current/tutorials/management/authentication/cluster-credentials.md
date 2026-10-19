---
title: "クラスターの認証情報 | Cloud"
slug: /cluster-credentials
sidebar_label: "クラスターの認証情報"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はトークンを使用して ID を認証します。トークンにはクラスターの認証情報または API キーを使用できます。このガイドでは、クラスターの認証情報を使用した認証について説明します。 | Cloud"
type: origin
token: YmsVwIzOBinv4OklCfmc2nyznAe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターの認証情報

Zilliz Cloud はトークンを使用して ID を認証します。トークンにはクラスターの認証情報または API キーを使用できます。このガイドでは、クラスターの認証情報を使用した認証について説明します。

クラスターの認証情報はユーザー名とパスワードのペア（`user:password`）で構成され、クラスターを操作するリクエストの認証と認可に使用されます。

クラスターを設定すると、Zilliz Cloud は `Admin` ロールを持つデフォルトのクラスターユーザー `db_admin` を作成し、クラスターへのフルアクセス権を付与します。デフォルトユーザーのパスワードはクラスターの作成時に一度だけ表示されるため、必ず控えて適切な場所に安全に保管してください。

デフォルトの `db_admin` ユーザーに加えて、[クラスターユーザーを作成](./cluster-users#create-a-cluster-user)し、認証用のパスワードをそれぞれ設定することもできます。

## パスワードのリセット\{#reset-password}

ユーザーのパスワードを忘れた場合、またはパスワードが漏えいした疑いがある場合は、パスワードをリセットできます。

- **コンソールでユーザーパスワードをリセットする**

    ![reset-クラスター-user-password](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-cluster-user-password.png "reset-クラスター-user-password")

- **プログラムでユーザーパスワードをリセットする**

    RESTful API または SDK を使用して、プログラムでユーザーパスワードをリセットできます。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import MilvusClient
    client = MilvusClient(
        uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
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
    import io.milvus.v2.service.rbac.request.UpdatePasswordReq;
    UpdatePasswordReq updatePasswordReq = UpdatePasswordReq.builder()
            .userName("user_1")
            .password("P@ssw0rd")
            .newPassword("NewP@ssw0rd")
            .build();
    client.updatePassword(updatePasswordReq);
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import (
        "context"
        "fmt"
    
        "github.com/milvus-io/milvus/client/v3/milvusclient"
    )
    
    ctx := context.Background()
    
    client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
        APIKey:  "user:password",
    })
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    defer client.Close(ctx)
    
    err = client.UpdatePassword(ctx, milvusclient.NewUpdatePasswordOption("user_1", "P@ssw0rd", "NewP@ssw0rd"))
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    use milvus::v2::prelude::*;
    
    let client = ClientV2::new(&ConnectConfig::new()
        .uri("https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530")
        .token("user:password")).await?;
    
    client.update_password(UpdatePasswordRequest::builder()
        .username("user_1")
        .old_password("P@ssw0rd")
        .new_password("NewP@ssw0rd")
        .build()?).await?;
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    #include <iostream>
    #include "milvus/MilvusClientV2.h"
    
    auto client = milvus::MilvusClientV2::Create();
    
    milvus::ConnectParam connect_param{"https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530", "user:password"};
    auto status = client->Connect(connect_param);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    
    status = client->UpdatePassword(
        milvus::UpdatePasswordRequest()
            .WithUserName("user_1")
            .WithOldPassword("P@ssw0rd")
            .WithNewPassword("NewP@ssw0rd")
    );
    
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
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
