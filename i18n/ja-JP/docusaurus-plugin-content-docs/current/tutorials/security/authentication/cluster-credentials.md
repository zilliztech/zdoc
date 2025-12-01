---
title: "クラスターロredentials | Cloud"
slug: /cluster-credentials
sidebar_label: "クラスターロredentials"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、トークンを使用してユーザーの身元を認証します。トークンはクラスターロredentialsまたはAPIキーのいずれかです。このガイドでは、クラスターロredentialsを使用した認証について説明します。 | Cloud"
type: origin
token: YmsVwIzOBinv4OklCfmc2nyznAe
sidebar_position: 3
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスターロredentials
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターロredentials

Zilliz Cloudは、トークンを使用してユーザーの身元を認証します。トークンはクラスターロredentialsまたはAPIキーのいずれかです。このガイドでは、クラスターロredentialsを使用した認証について説明します。

クラスターロredentialsは、ユーザー名とパスワードのペア（`user:password`）で構成され、クラスターとの通信要求の認証と承認に使用されます。

クラスターをセットアップする際、Zilliz Cloudは`Admin`ロールを持つデフォルトのクラスターユーザー`db_admin`を作成し、クラスターへの完全アクセス権を付与します。デフォルトユーザーのパスワードは、クラスター作成時に一度だけ表示されるため、控えて安全な場所に保管することが重要です。

デフォルトの`db_admin`ユーザーに加えて、認証用に対応するパスワードを持つ[複数のクラスターユーザーを作成](./cluster-users#create-a-cluster-user)することもできます。

## パスワードをリセット\{#reset-password}

ユーザーのパスワードを忘れた場合や、漏洩した疑いがある場合は、パスワードをリセットできます。

- **コンソールでユーザーパスワードをリセット**

    ![reset-cluster-user-password](/img/reset-cluster-user-password.png "reset-cluster-user-password")

- **プログラムでユーザーパスワードをリセット**

    RESTful APIまたはSDKを使用して、プログラムでユーザーパスワードをリセットできます。

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

    err := mclient.UpdatePassword(context.Background(), opts, callOption)
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