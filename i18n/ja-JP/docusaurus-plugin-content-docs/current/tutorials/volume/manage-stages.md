---
title: "ボリュームの管理（SDK） | Cloud"
slug: /manage-stages
sidebar_label: "ボリュームの管理（SDK）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud でデータを管理する際にボリュームを使用する方法について説明します。Web コンソールを使用したボリューム管理の詳細については、ボリュームの管理（コンソール）を参照してください。 | Cloud"
type: origin
token: VCL7wmP6oieCkJkHEcicCsKQnxc
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - ボリューム
  - オープンソースベクターデータベース
  - ベクターデータベースの例
  - RAGベクターデータベース
  - ベクターデータベースとは

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ボリュームの管理（SDK）

このページでは、Zilliz Cloud でデータを管理する際にボリュームを使用する方法について説明します。Web コンソールを使用したボリューム管理の詳細については、[ボリュームの管理（コンソール）](./manage-volumes-via-console)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>ボリュームは AWS および Google Cloud でのみ作成できます。Azure でボリュームを使用する必要がある場合は、<a href="http://support.zilliz.com">サポートにお問い合わせください</a>。</p>
<p>ボリュームからクラスターにデータをインポート、マージ、または移行するには、ボリュームとクラスターが同じクラウドリージョン内にあることを確認してください。</p>

</Admonition>

## ボリュームの作成、一覧表示、および削除\{#create-list-and-delete-volumes}

サービス要件に応じて、ボリュームを作成し、すべての利用可能なボリュームを一覧表示し、必要のなくなったボリュームを削除することで、ボリュームのライフサイクルを管理できます。

### ボリュームマネージャーの初期化\{#initiate-a-volume-manager}

ボリュームマネージャーは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームを管理する前に、ボリュームマネージャーを初期化する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

### ボリュームの作成\{#create-a-volume}

ボリュームは Zilliz Cloud プロジェクト固有のものです。ボリュームを作成する際には、プロジェクト ID、リージョン ID、およびボリューム名を指定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
volume_manager.create_volume(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
    region_id="aws-us-west-1", 
    volume_name="my_volume"
)

print(f"\nVolume my_volume created")

# Volume my_volume created
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.volume.CreateVolumeRequest;

CreateVolumeRequest request = CreateVolumeRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .regionId("aws-us-west-1")
    .volumeName("my_volume")
    .build();

volumeManager.createVolume(request);

System.out.printf("\nVolume %s created%n", "my_volume");

// Volume my_volume created
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/volumes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-1",
    "volumeName": "my_volume"
}'

# {
#     "code": 0,
#     "data": {
#         "volumeName": "my_volume"
#     }
# }
```

</TabItem>
</Tabs>

上記のコマンドでは、以下に注意してください。

- `regionId`: 作成するボリュームのリージョンは、データをインポートまたは移行する予定のターゲットクラスターのクラウドプロバイダーとリージョンと一致する必要があります。

- `volumeName`: 作成するボリューム名は、組織全体で一意である必要があり、64文字以内で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含む必要があります。

### ボリュームの一覧表示\{#list-volumes}

特定の Zilliz Cloud プロジェクト内にすでに作成されたボリュームを以下のように確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
volume_list = volume_manager.list_volumes(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
    current_page=1, 
    page_size=10
)

print(f"\nlistVolumes results: \n", volume_list.json()['data'])

# listVolumes results: 
# 
# {
#     "count": 1,
#     "currentPage": 1,
#     "pageSize": 10,
#     "volumes": [
#         {
#             "volumeName": "my_volume"
#         }        
#     ]
# }
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import io.milvus.bulkwriter.request.volume.ListVolumesRequest;

ListVolumesRequest request = ListVolumesRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .currentPage(1)
    .pageSize(10)
    .build();
    
ListVolumesResponse listVolumesResponse = volumeManager.listVolumes(request);

System.out.println("\nlistVolumes results: " + new Gson().toJson(listVolumesResponse));

// listVolumes results: 
// 
// {
//     "count": 1,
//     "currentPage": 1,
//     "pageSize": 10,
//     "volumes": [
//         {
//             "volumeName": "my_volume"
//         }        
//     ]
// }
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/volumes?projectId=proj-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "count": 1,
#         "currentPage": 1,
#         "pageSize": 10,
#         "volumes": [
#             {
#                 "volumeName": "my_volume"
#             }        
#         ]
#     }
# }
```

</TabItem>
</Tabs>

### ボリュームの削除\{#delete-a-volume}

必要なくなったボリュームは削除できます。ボリュームを削除するには、以下のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
volume_manager.delete_volume(
    volume_name="my_volume"
)

print(f"\nVolume my_volume deleted")

# Volume my_volume deleted
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;

DeleteVolumeRequest request = DeleteVolumeRequest.builder()
    .volumeName("my_volume")
    .build();

volumeManager.deleteVolume(request);

System.out.printf("\nVolume %s deleted%n", "my_volume");

// Volume my_volume deleted
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export VOLUME_NAME="my_volume"

curl --request DELETE \
--url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "volumeName": "my_volume"
#     }
# }
```

</TabItem>
</Tabs>

## データをボリュームにアップロード\{#upload-data-into-a-volume}

ボリュームの準備ができたら、データをボリュームにアップロードします。

### ボリュームファイルマネージャーの初期化\{#initiate-a-volume-file-manager}

ボリュームファイルマネージャーは、Zilliz Cloud のボリュームサービス上の特定のボリュームへの接続を維持します。ボリュームにファイルをアップロードする前に、ボリュームファイルマネージャーを初期化する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager

volume_file_manager = VolumeFileManager(
    cloud_endpoint='https://api.cloud.zilliz.com',
    api_key='YOUR_API_KEY',
    volume_name='my_volume',
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.VolumeFileManager;
import io.milvus.bulkwriter.VolumeFileManagerParam;

VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withVolumeName("my_volume")
    .build();

VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
```

</TabItem>
</Tabs>

### ファイルのアップロード\{#upload-files}

ボリュームファイルマネージャーの準備ができたら、これを使用して指定されたボリュームにファイルをアップロードします。次の例では、ローカルのソースファイルパスにあるファイルをボリューム内のターゲットファイルパスにアップロードします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
result = volume_file_manager.upload_file_to_volume(
    source_file_path="/path/to/your/local/data/file", 
    target_volume_path="data/"
)

print(f"\nuploadFileToVolume results: {result}")

# uploadFileToVolume results: 
# 
# {
#     "volumeName": "my_volume",
#     "path": "data/"
# }
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import io.milvus.bulkwriter.model.UploadFilesResult;
import io.milvus.bulkwriter.request.volume.UploadFilesRequest;

UploadFilesRequest request = UploadFilesRequest.builder()
    .sourceFilePath("/path/to/your/local/data/file")
    .targetVolumePath("data/")
    .build();

UploadFilesResult result = volumeFileManager.uploadFilesAsync(request).get();

System.out.println("\nuploadFiles results: " + new Gson().toJson(result));

// uploadFileToVolume results: 
// 
// {
//     "volumeName": "my_volume",
//     "path": "data/"
// }
```

</TabItem>
</Tabs>