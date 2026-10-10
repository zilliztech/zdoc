---
title: "クラスター Credentials | BYOC"
slug: /cluster-credentials
sidebar_label: "クラスター Credentials"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud authenticates your identity using a token. A token can be either the クラスター credential or an API key. This guide introduces authentication with クラスター credentials. | BYOC"
type: origin
token: YmsVwIzOBinv4OklCfmc2nyznAe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスター Credentials

Zilliz Cloud authenticates your identity using a token. A token can be either the クラスター credential or an API key. This guide introduces authentication with クラスター credentials.

A クラスター credential consists of a username and password pair (`user:password`), utilized to authenticate and authorize your requests for クラスター interaction.

When setting up a クラスター, Zilliz Cloud creates the default クラスター user `db_admin` with the `Admin` role, granting full クラスター access. The password of the default user will only be shown once during クラスター creation, so it is crucial to note it down and securely store it in an appropriate location.

Beyond the default `db_admin` user, you can also [create](./cluster-users#create-a-cluster-user) more クラスター users with corresponding password for authentication.

## Reset Password\{#reset-password}

ユーザーのパスワードを忘れた場合や、漏洩した可能性がある場合は、パスワードをリセットできます。

- **コンソールでユーザーパスワードをリセットする**

    ![reset-クラスター-user-password](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-cluster-user-password.png "reset-クラスター-user-password")

- **プログラムでユーザーパスワードをリセットする**

    RESTful API または SDK を使用して、プログラムでユーザーパスワードをリセットできます。

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
