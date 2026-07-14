---
title: "クラスター接続の準備 | BYOC"
slug: /prepare-for-cluster-connection
sidebar_label: "クラスター接続の準備"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "すべての BYOC クラスターはお客様自身の仮想ネットワーク（AWS VPC、GCP VPC、または Microsoft Azure VNet）内で完全にホストされており、パブリックエンドポイントを持ちません。このガイドでは、これらの BYOC クラスターに接続する 2 つの方法について説明します。 | BYOC"
type: origin
token: Ah0DwMIWsilLa4kVbYocJGCMnlh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# クラスター接続の準備

すべての BYOC クラスターはお客様自身の仮想ネットワーク（AWS VPC、GCP VPC、または Microsoft Azure VNet）内で完全にホストされており、パブリックエンドポイントを持ちません。このガイドでは、これらの BYOC クラスターに接続する 2 つの方法について説明します。

<details>

<summary>クラウドプロバイダーで使用される用語とその対応関係</summary>

このガイドは、クラウドプロバイダーに関係なく、すべての BYOC クラスターに適用されます。用語の違いに対応し、説明を簡潔にするために、このガイドで使用する用語と、各プロバイダーで使用される用語との対応を以下に示します。

| 用語 | AWS | GCP | Azure |
| --- | --- | --- | --- |
| **仮想ネットワーク** | VPC | VPC | VNet |
| **セキュリティグループ** | Security group | Firewall rules | Network Security Group (NSG) |
| **ロードバランサー** | Network Load Balancer (NLB) | Cloud Load Balancer | Load Balancer |
| **プライベートエンドポイント** | PrivateLink | Private Service Connect (PSC) | Private Link |
| **仮想ネットワークエンドポイント** | VPC Endpoint | PSC Endpoint | Private Endpoint |
| **仮想ネットワークエンドポイントサービス** | VPC Endpoint Service | PSC Publishing | Private Link Service |

</details>

## 利用可能な接続モード\{#available-connection-modes}

BYOC クラスターには、次のいずれかのモードで接続できます。

- **[Direct VPC アクセス](./prepare-for-cluster-connection#direct-vpc-access)**

    このモードでは、通常 BYOC クラスターとやり取りするアプリケーションであるクライアントが、BYOC クラスターと同じ仮想ネットワーク内に存在します。このモードはデフォルトの選択肢であり、追加のネットワーク設定は不要です。 

    これを使用するには、**データプレーンのデプロイ時に private endpoint を選択しないでください。**

- **[Private endpoint アクセス](./prepare-for-cluster-connection#private-endpoint-access)**

    このモードでは、クライアントは複数の仮想ネットワークまたは異なるアカウントにまたがって存在できます。これには一度だけセットアップが必要ですが、private endpoint を配置すれば、新しいクラスターの追加や追加のクライアント仮想ネットワークの接続は簡単になります。 

    これを使用するには、**データプレーンのデプロイ時に private endpoint を有効にしてください。**

次の表では、これら 2 つのモードを、セットアップの複雑さ、可用性、クラスター単位のアクセス制御、クロスアカウントサポート、および複数仮想ネットワークへのスケーラビリティの観点から比較しています。

|  | **モード 1: Direct VPC アクセス** | **モード 2: PrivateLink アクセス** |
| --- | --- | --- |
| **最適な用途** | データプレーンと同じ VPC 内のクライアント | 複数の VPC または異なるアカウント内のクライアント |
| **セットアップの複雑さ** | 低 — デプロイ後はデフォルトで動作 | 一度だけセットアップが必要。新しいクラスターが追加されるとスケールしやすく、wildcard DNS により自動的にアクセス可能 |
| **可用性** | すべての BYOC デプロイメントのデフォルト | 現在は有効化のために Zilliz Support への問い合わせが必要（セルフサービスは近日対応予定） |
| **クラスター単位のアクセス制御** | クラスターの load balancer ごとの Security Group | Kubernetes Envoy Gateway SecurityPolicy |
| **クロスアカウントサポート** | いいえ | はい |
| **複数仮想ネットワークへのスケーラビリティ** | 低 — 新しいクライアント VPC ごとに個別の VPC Peering とルーティング設定が必要です。 | 高 — 新しいクライアント VPC は単一の Endpoint Service 経由で接続し、新しいクラスターにも即座に到達できます。 |

## Direct VPC access\{#direct-vpc-access}

各 BYOC クラスターは実際には Kubernetes クラスターであり、エントリポイントとして load balancer を公開しています。load balancer は、受信トラフィックをポート 19530 でクラスターに転送します。Zilliz はパブリックホストゾーンを通じてクラスターエンドポイントを管理しているため、クライアントが load balancer へのレイヤー 3 接続を確立していれば、どのネットワークからでもトラフィックを名前解決できます。

![WXXlwsQOfhAw5NbizaFcvEYJnBh](https://zdoc-images.s3.us-west-2.amazonaws.com/WXXlwsQOfhAw5NbizaFcvEYJnBh.png)

上の図は、クライアントアプリケーションから BYOC クラスターへのトラフィックフローを示しています。ここでは、クラスターごとの load balancer が各クラスター内の Milvus Proxy にトラフィックを転送します。各クラスターは独自の load balancer を持つため、クラスター単位のアクセス制御を実装できます。

### 前提条件\{#prerequisites}

- クライアントアプリケーションが BYOC プロジェクトのデータプレーンと同じ仮想ネットワーク内で実行されているか、またはクライアント仮想ネットワークとデータプレーン仮想ネットワークが適切なルートテーブルエントリを持つ仮想ネットワークピアリングで接続されていること。

- クライアントに関連付けられた security group が、データプレーン仮想ネットワークセグメントへの **ポート 19530 のアウトバウンドトラフィック** を許可していること。

- データプレーンの security group が、クライアントのネットワークセグメントまたは security group からの **ポート 19530 のインバウンドトラフィック** を許可していること。

### ステップ 1: クラスターエンドポイントを取得する\{#step-1-get-your-cluster-endpoint}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com)を開きます。

1. BYOC プロジェクトに移動し、クラスターを選択します。

1. **Cluster Details** ページで、**Connect** カードを見つけます。

1. **Cluster Endpoint** をコピーします。形式は `https://${cluster-id}-internal.${region}.byoc.vectordb.zillizcloud.com:19530` です。

    <Admonition type="info" icon="📘" title="Notes">

    Terraform を使用してデプロイされた BYOC クラスターについては、Terraform の出力からエンドポイントを取得することもできます。

    </Admonition>

</Procedures>

### ステップ 2: クラスターに接続する\{#step-2-connect-to-the-cluster}

次に、コピーしたクラスターエンドポイントと認証情報を使用してクラスターに接続できます。詳細については、[Connect to Clusters](./connect-to-clusters) を参照してください。

## Private endpoint access\{#private-endpoint-access}

BYOC プロジェクトのデータプレーンのデプロイ中に private endpoint を有効にしている場合、データプレーン仮想ネットワーク内に共有 gateway がデプロイされ、そのエントリポイントとして単一の load balancer が使用されます。gateway は TLS を終端し、リクエストのホスト名に基づいて正しいクラスターにトラフィックをルーティングします。 

この場合、その load balancer を virtual network endpoint として公開する必要があります。これにより、他のクラウドプロバイダーアカウント内のものを含む任意の数のクライアント仮想ネットワークが、その endpoint 経由で BYOC クラスターに接続できるようになります。

![L0zPwoEePhJF9Bbgln3cQXFMn8e](https://zdoc-images.s3.us-west-2.amazonaws.com/L0zPwoEePhJF9Bbgln3cQXFMn8e.png)

上の図に示すように、クライアントアプリケーションと BYOC クラスター間のトラフィックは、クライアント仮想ネットワーク内の virtual network endpoint、virtual network endpoint service、Zilliz Gateway として機能するデータプレーン仮想ネットワーク内の共有 load balancer、クラスター固有の TLS termination gateway、そして各クラスター内の Milvus Proxy を通過します。

クラスターエンドポイント (`*.${region}.byoc.vectordb.zillizcloud.com`) は、Zilliz Cloud によって管理されるパブリックアドレスに名前解決されます。したがって、各クライアント仮想ネットワークでは、wildcard ドメインを仮想ネットワークのプライベート IP アドレスに向ける DNS レコードを追加して、DNS 解決をオーバーライドする必要があります。

<Admonition type="info" icon="📘" title="Notes">

データプレーンのデプロイ時に private endpoint オプションを選択解除していて、private endpoint access が必要な場合は、データプレーンで gateway デプロイメントを有効にできるよう [お問い合わせください](https://support.zilliz.com/hc/en-us/requests/new)。 

</Admonition>

### 前提条件\{#prerequisites}

- BYOC プロジェクトを所有しており、gateway がデプロイされていることを Zilliz Technical Support が確認していること。

- virtual network endpoint、virtual network endpoint service、および DNS レコードを管理する権限を持っていること。

- クライアント仮想ネットワークが、BYOC プロジェクトのデータプレーンと同じリージョンにあること。

### ステップ 1: Virtual Network Endpoint Service を作成する\{#step-1-create-a-virtual-network-endpoint-service}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

データプレーン内の load balancer の名前は `zilliz-gateway` です。クライアント仮想ネットワークが接続できるように、この load balancer から virtual network endpoint service を作成する必要があります。

利用可能な方法は 3 つあります。AWS コンソール、AWS CloudShell、または Zilliz が提供する Terraform スクリプトを使用して virtual network endpoint を作成できます。

#### AWS コンソールで\{#on-aws-console}

<Procedures>

1. **VPC** コンソールに移動し、**PrivateLink and Lattice** > **Endpoint services** を選択します。

1. **Create endpoint service** をクリックします。

1. **Load balancer type** で、**Network** を選択します。

1. **Available load balancers** で、**`zilliz-gateway`** という名前の NLB を選択します。

1. アクセス制御の好みに応じて **Acceptance required** を設定します（自動承認の場合は無効化）。

1. **Create endpoint service** をクリックします。

1. **Service name**（例: `com.amazonaws.vpce.${region}.vpce-svc-xxxxxxxxxxxxxxxxx`）を控えます。これはすべてのクライアント VPC オーナーと共有します。

</Procedures>

#### AWS CloudShell で\{#in-aws-cloudshell}

次のコマンドを実行して virtual network endpoint を作成します。

```bash
# Get the ARN of the zilliz-gateway NLB
NLB_ARN=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?LoadBalancerName=='zilliz-gateway'].LoadBalancerArn" \
  --output text)

# Create the endpoint service
aws ec2 create-vpc-endpoint-service-configuration \
  --network-load-balancer-arns "$NLB_ARN" \
  --no-acceptance-required \
  --query "ServiceConfiguration.ServiceName" \
  --output text
```

#### Terraform を使用する\{#using-terraform}

次のコマンドを実行して virtual network endpoint を作成します。

```bash
data "aws_lb" "zilliz_gateway" {
  name = "zilliz-gateway"
}

resource "aws_vpc_endpoint_service" "zilliz_gateway" {
  network_load_balancer_arns = [data.aws_lb.zilliz_gateway.arn]
  acceptance_required        = false
}

output "endpoint_service_name" {
  value = aws_vpc_endpoint_service.zilliz_gateway.service_name
}
```

</TabItem>

<TabItem value="gcp">

#### GCP コンソールで\{#on-the-gcp-console}

#### GCP Cloud Shell で\{#in-gcp-cloud-shell}

#### Terraform を使用する\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### Azure コンソールで\{#on-the-azure-console}

#### Azure Cloud Shell で\{#in-azure-cloud-shell}

#### Terraform を使用する\{#using-terraform}

</TabItem>

</Tabs>

### ステップ 2: 各クライアント仮想ネットワークに Virtual Network Endpoint を作成する\{#step-2-create-a-virtual-network-endpoint-in-each-client-virtual-network}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

#### AWS コンソールで\{#on-aws-console}

BYOC クラスターに接続する必要があるすべてのクライアント VPC について、次の手順を繰り返します。

<Procedures>

1. **VPC** コンソールに移動し、**PrivateLink and Lattice** > **Endpoints** を選択します。

1. **Create endpoint** をクリックします。

1. **Service category** で、**Other endpoint services** を選択します。

1. ステップ 1 の **Service name** を貼り付け、**Verify service** をクリックします。

1. クライアントアプリケーションが実行される **VPC** を選択します。

1. 使用したい各アベイラビリティゾーンの **subnets** を選択します。

1. ポート 19530 のインバウンドトラフィックを許可する **security group** を割り当てます。

1. **Create endpoint** をクリックします。

1. endpoint のステータスが **Available** になるまで待ちます。

</Procedures>

上で作成した各 VPC Endpoint について、各 subnet に割り当てられたプライベート IP アドレスを次のように取得します。

<Procedures>

1. **VPC** コンソールに移動し、**Endpoints** をクリックします。

1. endpoint を選択し、**Subnets** タブに移動します。

1. 各 subnet に表示されている **IP address** を控えます。これらは A レコードのターゲットとして使用します。

</Procedures>

#### AWS CloudShell で\{#in-aws-cloudshell}

プレースホルダーを実際の値に置き換えてコマンドを実行します。

```bash
# Replace with your values
SERVICE_NAME="com.amazonaws.vpce.${region}.vpce-svc-xxxxxxxxxxxxxxxxx"
VPC_ID="vpc-xxxxxxxxxxxxxxxxx"
SUBNET_IDS="subnet-aaa subnet-bbb subnet-ccc"
SECURITY_GROUP_ID="sg-xxxxxxxxxxxxxxxxx"

aws ec2 create-vpc-endpoint \
  --vpc-endpoint-type Interface \
  --service-name "$SERVICE_NAME" \
  --vpc-id "$VPC_ID" \
  --subnet-ids $SUBNET_IDS \
  --security-group-ids "$SECURITY_GROUP_ID"
```

#### Terraform を使用する\{#using-terraform}

プレースホルダーを実際の値に置き換えてコマンドを実行します。

```bash
resource "aws_vpc_endpoint" "zilliz_byoc" {
  vpc_id              = var.client_vpc_id
  service_name        = aws_vpc_endpoint_service.zilliz_gateway.service_name
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.client_subnet_ids
  security_group_ids  = [var.client_security_group_id]
}
```

</TabItem>

<TabItem value="gcp">

#### GCP コンソールで\{#on-the-gcp-console}

#### GCP Cloud Shell で\{#in-gcp-cloud-shell}

#### Terraform を使用する\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### Azure コンソールで\{#on-the-azure-console}

#### Azure Cloud Shell で\{#in-azure-cloud-shell}

#### Terraform を使用する\{#using-terraform}

</TabItem>

</Tabs>

### ステップ 3: DNS レコードを設定する\{#step-3-configure-dns-records}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

クラスターエンドポイントドメイン (`*.aws-${region}.byoc.vectordb.zillizcloud.com`) は、パブリックに到達可能な Zilliz 管理の IP アドレスに名前解決されます。これを VPC Endpoint にリダイレクトするには、VPC 内で DNS 解決をオーバーライドする private Route 53 hosted zone を作成する必要があります。 

BYOC クラスターに接続する必要があるすべてのクライアント VPC について、次の手順を繰り返します。

<Procedures>

1. **Route 53** コンソールを開き、**Hosted zones** に移動します。

1. **Create hosted zone** をクリックします。

1. **Domain name** を `aws-${region}.byoc.vectordb.zillizcloud.com` に設定します（`${region}` は AWS リージョンに置き換えてください。例: `aws-us-west-2.byoc.vectordb.zillizcloud.com`）。

1. **Type** を **Private hosted zone** に設定します。

1. クライアント VPC に関連付けます。

1. **Create hosted zone** をクリックします。

1. hosted zone 内で、**Create record** をクリックします。

1. **Record name** を `*`（wildcard）に設定します。

1. **Record type** を **A** に設定します。

1. 上で取得した endpoint IP アドレスを入力します（multivalue を使用する場合は 1 行に 1 つ）。

1. **Create records** をクリックします。

</Procedures>

#### AWS CloudShell で\{#in-aws-cloudshell}

プレースホルダーを実際の値に置き換えてコマンドを実行します。

```bash
REGION="us-west-2"
VPC_ID="vpc-xxxxxxxxxxxxxxxxx"
HOSTED_ZONE_NAME="aws-${REGION}.byoc.vectordb.zillizcloud.com"
ENDPOINT_IPS='["10.0.1.x", "10.0.2.x", "10.0.3.x"]'  # Replace with your endpoint IPs

# Create the private hosted zone
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name "$HOSTED_ZONE_NAME" \
  --caller-reference "$(date +%s)" \
  --hosted-zone-config "PrivateZone=true" \
  --vpc "VPCRegion=${REGION},VPCId=${VPC_ID}" \
  --query "HostedZone.Id" \
  --output text)

# Add the wildcard A record
aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"CREATE\",
      \"ResourceRecordSet\": {
        \"Name\": \"*.${HOSTED_ZONE_NAME}\",
        \"Type\": \"A\",
        \"TTL\": 60,
        \"ResourceRecords\": $(echo $ENDPOINT_IPS | jq '[.[] | {\"Value\": .}]')
      }
    }]
  }"
```

同じ hosted zone に追加の VPC を関連付けるには、次を実行します。

```dart
aws route53 associate-vpc-with-hosted-zone \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --vpc "VPCRegion=${REGION},VPCId=${ADDTIONAL_VPC_ID}"
```

#### Terraform を使用する\{#using-terraform}

プレースホルダーを実際の値に置き換えてコマンドを実行します。

```bash
locals {
  region         = "us-west-2"
  endpoint_ips   = ["10.0.1.x", "10.0.2.x", "10.0.3.x"]  # Replace with your endpoint IPs
}

resource "aws_route53_zone" "zilliz_byoc" {
  name = "aws-${local.region}.byoc.vectordb.zillizcloud.com"

  vpc {
    vpc_id = var.client_vpc_id
  }
}

resource "aws_route53_record" "zilliz_byoc_wildcard" {
  zone_id = aws_route53_zone.zilliz_byoc.zone_id
  name    = "*.aws-${local.region}.byoc.vectordb.zillizcloud.com"
  type    = "A"
  ttl     = 60
  records = local.endpoint_ips
}

# Associate additional VPCs if needed
resource "aws_route53_zone_association" "additional_vpc" {
  for_each = toset(var.additional_vpc_ids)

  zone_id = aws_route53_zone.zilliz_byoc.zone_id
  vpc_id  = each.value
}
```

</TabItem>

<TabItem value="gcp">

#### GCP コンソールで\{#on-the-gcp-console}

#### GCP Cloud Shell で\{#in-gcp-cloud-shell}

#### Terraform を使用する\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### Azure コンソールで\{#on-the-azure-console}

#### Azure Cloud Shell で\{#in-azure-cloud-shell}

#### Terraform を使用する\{#using-terraform}

</TabItem>

</Tabs>

### ステップ 4: クラスターに接続する\{#step-4-connect-to-the-cluster}

次に、コピーしたクラスターエンドポイントと認証情報を使用してクラスターに接続できます。詳細については、[Connect to Clusters](./connect-to-clusters) を参照してください。

## トラブルシューティング\{#troubshootings}

次の表は、準備中によく発生する問題を示しています。 

| **症状** | **考えられる原因** | **解決方法** |
| --- | --- | --- |
| 接続タイムアウト（モード 1） | Security group がポート 19530 をブロックしている | データプレーンの security group にポート 19530 のインバウンドルールを追加するか、クライアントの security group にアウトバウンドルールを追加します。 |
| 接続タイムアウト（モード 2） | DNS がオーバーライドされていない、または VPC Endpoint の準備ができていない | hosted zone が正しい VPC に関連付けられていることを確認し、endpoint のステータスが Available であることを確認します |
| DNS が誤った IP アドレスに名前解決される（モード 2） | Private hosted zone がクライアント VPC に関連付けられていない | Route 53 hosted zone をすべてのクライアント VPC に関連付けます |
| TLS エラー | SDK で `secure=True` / HTTPS が指定されていない | endpoint URI が `https://` で始まっていることを確認します |

