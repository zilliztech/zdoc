---
title: "クラスター接続の準備 | BYOC"
slug: /prepare-for-cluster-connection
sidebar_key: prepare-for-cluster-connection
sidebar_label: "クラスター接続の準備"
beta: CONTACT SALES
notebook: FALSE
description: "すべての BYOC クラスターは、お客様の仮想ネットワーク（AWS VPC、GCP VPC、または Microsoft Azure VNet）上で完全にホストされており、パブリックエンドポイントを持ちません。このガイドでは、これらの BYOC クラスターに接続するための 2 つのアプローチについて説明します。| BYOC"
type: origin
token: Ah0DwMIWsilLa4kVbYocJGCMnlh
sidebar_position: 7
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - 権限
  - 最小権限
  - milvus
  - ベクトルデータベース
  - データベースへの接続
  - クラスターへの接続

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# クラスター接続の準備

すべての BYOC クラスターは、お客様の仮想ネットワーク（AWS VPC、GCP VPC、または Microsoft Azure VNet）上で完全にホストされており、パブリックエンドポイント は持ちません。本ガイドでは、これらの BYOC クラスターに接続するための 2 つのアプローチについて説明します。

<details>

<summary>クラウドプロバイダーが使用する用語とその同等語</summary>

本ガイドは、クラウドプロバイダーに関係なく、すべての BYOC クラスターに適用されます。用語の違いに対処し、説明を簡素化するため、本ガイドで使用される用語と、各プロバイダーで使用される用語との対応関係を以下に示します。

<table>
   <tr>
     <th><p>規約</p></th>
     <th><p>AWS</p></th>
     <th><p>GCP</p></th>
     <th><p>Azure</p></th>
   </tr>
   <tr>
     <td><p><strong>仮想ネットワーク</strong></p></td>
     <td><p>VPC</p></td>
     <td><p>VPC</p></td>
     <td><p>VNet</p></td>
   </tr>
   <tr>
     <td><p><strong>Security group</strong></p></td>
     <td><p>Security group</p></td>
     <td><p>Firewall rules</p></td>
     <td><p>ネットワーク Security Group (NSG)</p></td>
   </tr>
   <tr>
     <td><p><strong>Load balancer</strong></p></td>
     <td><p>ネットワーク Load Balancer (NLB)</p></td>
     <td><p>Cloud Load Balancer</p></td>
     <td><p>Load Balancer</p></td>
   </tr>
   <tr>
     <td><p><strong>プライベート endpoint</strong></p></td>
     <td><p>プライベートLink</p></td>
     <td><p>プライベート Service Connect (PSC)</p></td>
     <td><p>プライベート Link</p></td>
   </tr>
   <tr>
     <td><p><strong>仮想ネットワーク endpoint</strong></p></td>
     <td><p>VPC Endpoint</p></td>
     <td><p>PSC Endpoint</p></td>
     <td><p>プライベート Endpoint</p></td>
   </tr>
   <tr>
     <td><p><strong>仮想ネットワーク endpoint service</strong></p></td>
     <td><p>VPC Endpoint Service</p></td>
     <td><p>PSC Publishing</p></td>
     <td><p>プライベート Link Service</p></td>
   </tr>
</table>

</details>

## 利用可能な接続モード\{#available-connection-modes}

BYOC クラスターには、以下のいずれかのモードで接続できます。

- **[Direct VPC access](./prepare-for-cluster-connection#direct-vpc-access)**

    このモードでは、BYOC クラスターと対話するクライアント（通常はアプリケーション）が、BYOC クラスターと同じ仮想ネットワーク内に存在します。このモードはデフォルトの選択肢であり、追加のネットワーク設定は不要です。

    これを使用するには、**データプレーンのデプロイ中に private endpoint の選択を外してください。**

- **[プライベート endpoint access](./prepare-for-cluster-connection#private-endpoint-access)**

    このモードでは、クライアントが複数の仮想ネットワークにまたがって存在したり、異なるアカウントに存在したりする可能性があります。これには一度の設定が必要ですが、private endpoint を構築 once すれば、新しいクラスターの追加や追加のクライアント仮想ネットワークへの接続が容易になります。

    これを使用するには、**データプレーンのデプロイ中に private endpoint を有効にしてください。**

以下の表は、これらの 2 つのモードを設定の複雑さ、可用性、クラスターごとのアクセス制御、クロスアカウントサポート、およびマルチ仮想ネットワークのスケーラビリティの観点から比較したものです。

<table>
   <tr>
     <th></th>
     <th><p><strong>Mode 1: Direct VPC Access</strong></p></th>
     <th><p><strong>Mode 2: プライベートLink Access</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Best for</strong></p></td>
     <td><p>Clients in the same VPC as the data plane</p></td>
     <td><p>Clients in multiple VPCs or different accounts</p></td>
   </tr>
   <tr>
     <td><p><strong>Setup complexity</strong></p></td>
     <td><p>Low — works by default after deployment</p></td>
     <td><p>One-time setup; simpler to scale as 新しいクラスターs are added, automatically accessible via wildcard DNS</p></td>
   </tr>
   <tr>
     <td><p><strong>Availability</strong></p></td>
     <td><p>Default for all BYOC deployments</p></td>
     <td><p>Currently requires contacting Zilliz Support to enable (self-service coming soon)</p></td>
   </tr>
   <tr>
     <td><p><strong>Per-cluster access control</strong></p></td>
     <td><p>Security Group per cluster load balancer</p></td>
     <td><p>Kubernetes Envoy Gateway SecurityPolicy</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-account support</strong></p></td>
     <td><p>No</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Multi-virtual-network scalability</strong></p></td>
     <td><p>Low — each new client VPC requires a separate VPC Peering and routing configurations.</p></td>
     <td><p>High — new client VPCs connect via a single Endpoint Service; 新しいクラスターs are reachable immediately.</p></td>
   </tr>
</table>

## Direct VPC access\{#direct-vpc-access}

各 BYOC クラスターは実際には Kubernetes クラスターであり、エントリーポイントとしてロードバランサーを公開しています。ロードバランサーは、受信トラフィックをポート 19530 でクラスターに転送します。Zilliz はパブリックホストゾーン経由で クラスターエンドポイント を管理しているため、クライアントがロードバランサーに対してレイヤー 3 接続を確立していれば、任意のネットワークからトラフィックを解決できます。

![WXXlwsQOfhAw5NbizaFcvEYJnBh](https://zdoc-images.s3.us-west-2.amazonaws.com/WXXlwsQOfhAw5NbizaFcvEYJnBh.png)

上記の図は、クライアントアプリケーションから BYOC クラスターへのトラフィックフローを示しており、クラスター固有のロードバランサーがトラフィックを各クラスター内の Milvus プロキシ に転送します。各クラスターには独自のロードバランサーがあるため、クラスターレベルのアクセス制御を実装できます。

### 前提条件\{#prerequisites}

- クライアントアプリケーションが、BYOC プロジェクトのデータプレーンと同じ仮想ネットワーク内で実行されているか、あるいはクライアント仮想ネットワークとデータプレーン仮想ネットワークが、適切なルートテーブルエントリを持つ仮想ネットワークピアリングによって接続されていること。

- クライアントに関連付けられたセキュリティグループが、データプレーン仮想ネットワークセグメントに対する**ポート 19530 でのアウトバウンドトラフィック**を許可していること。

- データプレーンのセキュリティグループが、クライアントのネットワークセグメントまたはセキュリティグループからの**ポート 19530 でのインバウンドトラフィック**を許可していること。

### ステップ 1: クラスターエンドポイントを取得する\{#step-1-get-your-cluster-endpoint}

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com) を開きます。

1. BYOC プロジェクトに移動し、クラスターを選択します。

1. **クラスターの詳細** ページで、**Connect** カードを見つけます。

1. **クラスターエンドポイント** をコピーします。形式は `<i>http</i>s://${cluster-id}-internal.${region}.byoc.vectordb.zillizcloud.com:19530` です。

    <Admonition type="info" icon="📘" title="Notes">

    <p>Terraform を使用してデプロイされた BYOC クラスターの場合、Terraform の出力からエンドポイントを取得することもできます。</p>

    </Admonition>

</Procedures>

### ステップ 2: クラスターに接続する\{#step-2-connect-to-the-cluster}

次に、コピーしたクラスターエンドポイントと認証情報を使用してクラスターに接続できます。詳細については、[Connect to Cluster](./connect-to-cluster) を参照してください。

## プライベート endpoint access\{#private-endpoint-access}

BYOC プロジェクトのデータプレーンをデプロイする際に private endpoint を有効にした場合、単一のロードバランサーのエントリーポイントを持つ共有ゲートウェイがデータプレーン仮想ネットワーク内にデプロイされます。このゲートウェイは TLS を終端し、リクエストのホスト名に基づいてトラフィックを正しいクラスターにルーティングします。

この場合、ロードバランサーを仮想ネットワークエンドポイントとして公開する必要があります。これにより、他のクラウドプロバイダーアカウント内にあるものを含む、任意の数のクライアント仮想ネットワークが、そのエンドポイントを介して BYOC クラスターに接続できるようになります。

![L0zPwoEePhJF9Bbgln3cQXFMn8e](https://zdoc-images.s3.us-west-2.amazonaws.com/L0zPwoEePhJF9Bbgln3cQXFMn8e.png)

上記の図に示すように、クライアントアプリケーションと BYOC クラスター間のトラフィックは、クライアント仮想ネットワーク内の仮想ネットワークエンドポイント、仮想ネットワークエンドポイントサービス、Zilliz Gateway として機能するデータプレーン仮想ネットワーク内の共有ロードバランサー、クラスター固有の TLS 終端ゲートウェイ、そして各クラスター内の Milvus プロキシ を通過します。

クラスターエンドポイント (`*.${region}.byoc.vectordb.zillizcloud.com`) は、Zilliz Cloud によって管理されるパブリックアドレスに解決されます。したがって、各クライアント仮想ネットワークは、ワイルドカードドメインを仮想ネットワークのプライベート IP アドレスに向ける DNS レコードを追加することで、DNS 解決を上書きする必要があります。

<Admonition type="info" icon="📘" title="Notes">

<p>データプレーンのデプロイ中に private endpoint オプションの選択を外したが、private endpoint アクセスが必要な場合は、データプレーン内でのゲートウェイデプロイを有効にするために<a href="https://support.zilliz.com/hc/en-us/requests/new">お問い合わせください</a>。</p>

</Admonition>

### 前提条件\{#prerequisites}

- BYOC プロジェクトがあり、Zilliz テクニカルサポートによってゲートウェイがデプロイされたことが確認されていること。

- 仮想ネットワークエンドポイント、仮想ネットワークエンドポイントサービス、および DNS レコードを管理する権限を持っていること。

- クライアント仮想ネットワークが、BYOC プロジェクトのデータプレーンと同じリージョンにあること。

### ステップ 1: 仮想ネットワークエンドポイントサービスを作成する\{#step-1-create-a-virtual-network-endpoint-service}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

データプレーン内のロードバランサーの名前は `zilliz-gateway` です。クライアント仮想ネットワークがこれに接続できるように、このロードバランサーから仮想ネットワークエンドポイントサービスを作成する必要があります。

利用可能なオプションは 3 つあります。AWS コンソール、AWS CloudShell、または Zilliz が提供する Terraform スクリプトを使用して、仮想ネットワークエンドポイントを作成できます。

#### AWS コンソール上\{#on-aws-console}

<Procedures>

1. **VPC** コンソールに移動し、**プライベートLink and Lattice** > **Endpoint services** を選択します。

1. **Create endpoint service** をクリックします。

1. **Load balancer type** で、**ネットワーク** を選択します。

1. **Available load balancers** で、**`zilliz-gateway`** という名前の NLB を選択します。

1. アクセス制御の設定に応じて **Acceptance required** を設定します（自動承認の場合は無効にします）。

1. **Create endpoint service** をクリックします。

1. **サービス名**（例：`com.amazonaws.vpce.${region}.vpce-svc-xxxxxxxxxxxxxxxxx`）を控えます。これをすべてのクライアント VPC の所有者と共有します。

</Procedures>

#### AWS CloudShell 内\{#in-aws-cloudshell}

以下のコマンドを実行して、仮想ネットワークエンドポイントを作成します。

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

#### Terraform の使用\{#using-terraform}

仮想ネットワークエンドポイントを作成するには、以下のコマンドを実行します。

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

#### GCP コンソール上で\{#on-the-gcp-console}

#### GCP Cloud Shell 内で\{#in-gcp-cloud-shell}

#### Terraform を使用して\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### Azure コンソール上で\{#on-the-azure-console}

#### Azure Cloud Shell 内で\{#in-azure-cloud-shell}

#### Terraform を使用して\{#using-terraform}

</TabItem>

</Tabs>

### ステップ 2: 各クライアント仮想ネットワークに Virtual ネットワーク Endpoint を作成する\{#step-2-create-a-virtual-network-endpoint-in-each-client-virtual-network}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

#### AWS コンソール上で\{#on-aws-console}

BYOC クラスターに接続する必要のあるすべてのクライアント VPC について、以下の手順を繰り返してください。

<Procedures>

1. **VPC** コンソールに移動し、**プライベートLink and Lattice** > **Endpoints** を選択します。

1. **Create endpoint** をクリックします。

1. **Service category** で、**Other endpoint services** を選択します。

1. ステップ 1 の**サービス名**を貼り付け、**Verify service**をクリックします。

1. クライアントアプリケーションが実行されている**VPC**を選択します。

1. 使用する各アベイラビリティーゾーン内の**サブネット**を選択します。

1. ポート 19530 でのインバウンドトラフィックを許可する**セキュリティグループ**を割り当てます。

1. **Create endpoint** をクリックします。

1. エンドポイントのステータスが**Available**になるまで待ちます。

</Procedures>

上記で作成した各 VPC エンドポイントについて、各サブネットに割り当てられたプライベート IP アドレスを次のように取得します。

<Procedures>

1. **VPC** コンソールに移動し、**Endpoints**をクリックします。

1. エンドポイントを選択し、**サブネット**タブに移動します。

1. 各サブネットに記載されている**IPアドレス**を控えます。これらを A レコードのターゲットとして使用します。

</Procedures>

#### AWS CloudShell 内で\{#in-aws-cloudshell}

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

#### Terraform の使用\{#using-terraform}

プレースホルダーを実際の値に置き換えて、コマンドを実行してください。

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

#### GCP コンソール上で\{#on-the-gcp-console}

#### GCP Cloud Shell 内で\{#in-gcp-cloud-shell}

#### Terraform を使用して\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### Azure コンソール上で\{#on-the-azure-console}

#### Azure Cloud Shell 内で\{#in-azure-cloud-shell}

#### Terraform を使用して\{#using-terraform}

</TabItem>

</Tabs>

### ステップ 3: DNS レコードの設定\{#step-3-configure-dns-records}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

クラスターエンドポイントドメイン（`*.aws-${region}.byoc.vectordb.zillizcloud.com`）は、 publicly reachable な Zilliz 管理の IP アドレスに解決されます。これを VPC エンドポイントにリダイレクトするには、VPC 内での DNS 解決を上書きするプライベート Route 53 ホストゾーンを作成する必要があります。

BYOC クラスターに接続する必要のあるすべてのクライアント VPC について、以下の手順を繰り返してください。

<Procedures>

1. **Route 53** コンソールを開き、**Hosted zones** に移動します。

1. **Create hosted zone** をクリックします。

1. **Domain name** を `aws-${region}.byoc.vectordb.zillizcloud.com` に設定します（`${region}` をお使いの AWS リージョンに置き換えてください。例：`aws-us-west-2.byoc.vectordb.zillizcloud.com`）。

1. **Type** を **プライベート hosted zone** に設定します。

1. クライアント VPC に関連付けます。

1. **Create hosted zone** をクリックします。

1. ホストゾーン内で、**Create record** をクリックします。

1. **Record name** を `*`（ワイルドカード）に設定します。

1. **Record type** を **A** に設定します。

1. 上記のエンドポイント IP アドレスを入力します（マルチ値を使用する場合は 1 行に 1 つずつ入力します）。

1. **Create records** をクリックします。

</Procedures>

#### AWS CloudShell 内で\{#in-aws-cloudshell}

プレースホルダーを実際の値に置き換えて、コマンドを実行してください。

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

同じホストゾーンに追加の VPC を関連付けるには:

```dart
aws route53 associate-vpc-with-hosted-zone \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --vpc "VPCRegion=${REGION},VPCId=${ADDTIONAL_VPC_ID}"
```

#### Terraform の使用\{#using-terraform}

プレースホルダーを実際の値に置き換えて、コマンドを実行してください。

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

#### GCP コンソール上で\{#on-the-gcp-console}

#### GCP Cloud Shell 内で\{#in-gcp-cloud-shell}

#### Terraform を使用して\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### Azure コンソール上で\{#on-the-azure-console}

#### Azure Cloud Shell 内で\{#in-azure-cloud-shell}

#### Terraform を使用して\{#using-terraform}

</TabItem>

</Tabs>

### ステップ 4: クラスターへの接続\{#step-4-connect-to-the-cluster}

次に、コピーしたクラスターエンドポイントと認証情報を使用してクラスターに接続できます。詳細については、[クラスターへの接続](./connect-to-cluster) を参照してください。

## トラブルシューティング\{#troubshootings}

以下の表は、準備中に発生する可能性のある一般的な問題の一覧です。

<table>
   <tr>
     <th><p><strong>症状</strong></p></th>
     <th><p><strong>考えられる原因</strong></p></th>
     <th><p><strong>解決策</strong></p></th>
   </tr>
   <tr>
     <td><p>接続タイムアウト（モード 1）</p></td>
     <td><p>セキュリティグループがポート 19530 をブロックしている</p></td>
     <td><p>データプレーンのセキュリティグループでポート 19530 のインバウンドルールを追加するか、クライアントのセキュリティグループでアウトバウンドルールを追加します。</p></td>
   </tr>
   <tr>
     <td><p>接続タイムアウト（モード 2）</p></td>
     <td><p>DNS がオーバーライドされていない、または VPC エンドポイントが準備できていない</p></td>
     <td><p>ホストゾーンが正しい VPC に関連付けられているか確認し、エンドポイントのステータスが「Available」であることを確認します</p></td>
   </tr>
   <tr>
     <td><p>DNS が誤った IP アドレスに解決される（モード 2）</p></td>
     <td><p>プライベートホストゾーンがクライアント VPC に関連付けられていない</p></td>
     <td><p>Route 53 ホストゾーンをすべてのクライアント VPC に関連付けます</p></td>
   </tr>
   <tr>
     <td><p>TLS エラー</p></td>
     <td><p>SDK で <code>secure=True</code> / HTTPS が指定されていない</p></td>
     <td><p>エンドポイント URI が <code><i>http</i>s://</code> で始まっていることを確認します</p></td>
   </tr>
</table>

