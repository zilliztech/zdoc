---
title: "Cluster Credentials | Cloud"
slug: /cluster-credentials
sidebar_label: "Cluster Credentials"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はトークンを使用してユーザーのIDを認証します。トークンはクラスター認証情報または API キーのいずれかです。このガイドではクラスター認証情報を使用した認証について紹介します。 | Cloud"
type: origin
token: YmsVwIzOBinv4OklCfmc2nyznAe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cluster Credentials

Zilliz Cloud はトークンを使用してユーザーのIDを認証します。トークンはクラスター認証情報または API キーのいずれかです。このガイドではクラスター認証情報を使用した認証について紹介します。

クラスター認証情報は、クラスターとのやり取りに対するリクエストの認証と認可に使用される、ユーザー名とパスワードの組み合わせ（`user:password`）で構成されます。

クラスターをセットアップすると、Zilliz Cloud はデフォルトのクラスター ユーザー `db_admin` を `Admin` ロール付きで作成し、クラスターへのフルアクセスを付与します。デフォルト ユーザーのパスワードはクラスター作成時に一度だけ表示されるため、必ず控えて安全な場所に保管することが重要です。

デフォルトの `db_admin` ユーザーに加えて、認証用の対応するパスワードを持つ追加のクラスター ユーザーを[作成](./cluster-users#create-a-cluster-user)することもできます。

## パスワードをリセットする\{#reset-password}

ユーザーのパスワードを忘れた場合や、漏洩した疑いがある場合は、パスワードをリセットできます。

- **コンソールでユーザー パスワードをリセットする**

    ![reset-cluster-user-password](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-cluster-user-password.png "reset-cluster-user-password")

- **プログラムでユーザー パスワードをリセットする**

    RESTful API または SDK を使用して、プログラムでユーザー パスワードをリセットできます。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
