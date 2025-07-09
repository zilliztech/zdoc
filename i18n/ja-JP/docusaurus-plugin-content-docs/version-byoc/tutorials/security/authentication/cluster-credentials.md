---
title: "クラスタ資格情報 | BYOC"
slug: /cluster-credentials
sidebar_label: "クラスタ資格情報"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudはトークンを使用してあなたの身元を認証します。トークンはクラスター資格情報またはAPIキーのいずれかです。このガイドでは、クラスター資格情報を使用した認証について説明します。 | BYOC"
type: origin
token: YmsVwIzOBinv4OklCfmc2nyznAe
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスタ資格情報

Zilliz Cloudはトークンを使用してあなたの身元を認証します。トークンはクラスター資格情報またはAPIキーのいずれかです。このガイドでは、クラスター資格情報を使用した認証について説明します。

クラスター資格情報は、ユーザー名とパスワードのペア(`user:password`)で構成され、クラスターとのやり取りの要求を認証および承認するために使用されます。

クラスターを設定する際、Zilliz Cloudは`Admin`の役割を持つデフォルトのクラスターユーザー`db_admin`を作成し、完全なクラスターアクセスを許可します。デフォルトユーザーのパスワードはクラスター作成時に一度だけ表示されるため、メモして適切な場所に安全に保存することが重要です。

既定の`db_admin`ユーザー以外にも、認証に対応するパスワードを持つ[作成する](./cluster-users#create-a-cluster-user)クラスターユーザーを追加することもできます。

## パスワードのリセット{#reset-password}

ユーザーのパスワードを忘れた場合や漏洩の疑いがある場合は、パスワードをリセットできます。

- **コンソールでユーザーパスワードをリセット**

    ![reset-cluster-user-password](/img/reset-cluster-user-password.png)

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