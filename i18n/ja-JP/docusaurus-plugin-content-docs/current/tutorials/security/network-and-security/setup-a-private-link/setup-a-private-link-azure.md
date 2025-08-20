---
title: "Private Link (Azure) を設定する | Cloud"
slug: /setup-a-private-link-azure
sidebar_label: "Private Link (Azure) を設定する"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスターから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。 | Cloud"
type: origin
token: YminwoNGmi0ECFktXDlcH44inOe
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - privatelink
  - private endpoint
  - private service connect
  - aws
  - gcp
  - azure
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval

---

import Admonition from '@theme/Admonition';


# Private Link (Azure) を設定する

このガイドでは、Zilliz Cloudクラスターから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。

この機能は、専用(エンタープライズ)クラスターでのみ利用可能です。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクトの下で同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudはプライベートリンクに対して料金を請求しません。ただし、Zilliz Cloudにアクセスするために作成した<a href="https://azure.microsoft.com/ja-jp/pricing/details/private-link/">エンドポイントごと</a>に、クラウドプロバイダーから料金が請求される場合があります。</p>

</Admonition>

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- 専用(Enterprise)クラスタが作成されました。クラスタの作成方法については、「[クラスタ作成](./create-cluster)する」を参照してください。

## プライベートエンドポイントの作成する{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク&gt;プライベートエンドポイント**をクリックします。**+プライベートエンドポイント**をクリックします。

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### クラウドプロバイダーと地域を選択する{#select-a-cloud-provider-and-region}

Azureリージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、&#91;**Azure**&#93;を&#91;**クラウドプロバイダー**&#93;ドロップダウンリストから選択します。&#91;**リージョン**&#93;で、プライベートにアクセスするクラスターを収容するリージョンを選択します。&#91;**次**へ&#93;をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

![setup_private_link_window_azure](/img/setup_private_link_window_azure.png)

### エンドポイントサービスを確立する{#establish-and-endpoint-service}

![establish_endpoint_service_azure](/img/establish_endpoint_service_azure.png)

以下は[Microsoft Azureサブスクリプションページ](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1)からコピーしたサブスクリプションIDの例です。

### エンドポイントを作成する{#create-an-endpoint}

クラウドプロバイダーコンソールでこの手順を完了する必要があります。

1. [[プライベートリンクセンター](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints)&#93;に移動し、&#91;**+作成**&#93;をクリックします。

    ![NMJVb8eq1o8cysxlcM4c3N6rneh](/img/NMJVb8eq1o8cysxlcM4c3N6rneh.png)

1. 作成するプライベートエンドポイントの基本情報を入力してください。

    ![RSAebLea3oj1OyxXT6jc1IrJnph](/img/RSAebLea3oj1OyxXT6jc1IrJnph.png)

1. &#91;**Next: Resource&gt;**&#93;をクリックし、&#91;**Connect to an Azure resource by resource ID or alias**&#93;を選択します。次に、Zilliz Cloudコンソールからコピーしたリソースを**リソースIDまたはエイリアス**に貼り付けます。

    ![P5jUbCghNoJ26bxKnoycO1Lnn6r](/img/P5jUbCghNoJ26bxKnoycO1Lnn6r.png)

1. &#91;**仮想ネットワーク**&#93;と&#91;**サブネット**&#93;で適切な値を選択し、このタブのその他の設定はデフォルトのままにします。

    ![CthVb5C4Eouf0mxVARnc7RPEnZf](/img/CthVb5C4Eouf0mxVARnc7RPEnZf.png)

1. &#91;**次**へ&#93;をクリックして、&#91;**レビュー+作成**&#93;タブに移動します。検証に合格した場合は、&#91;**作成**&#93;をクリックしてプライベートエンドポイントを作成します。

    ![LxXxbI88joBShBxnK1McboINnTf](/img/LxXxbI88joBShBxnK1McboINnTf.png)

1. 展開が成功すると、以下が表示されます。

    ![H5TUbOss2oRNoMxIEp8cj9tdnmb](/img/H5TUbOss2oRNoMxIEp8cj9tdnmb.png)

1. &#91;**リソースに移動**&#93;をクリックして、作成したプライベートエンドポイントの概要ページを表示します。

1. Overviewページの右上にある**JSON View**をクリックしてくださ**い**。**Connection Status**は**Pending**と表示されます。

    ![Yf3CbAO3MoklJAxopqUck54dnvc](/img/Yf3CbAO3MoklJAxopqUck54dnvc.png)

    「**リソースJSON**」パネルで、`name`とproperties. resourceGuidの値をコピーし`ま`す。エンドポイントIDは、これら2つの値にピリオド(.)を付けたものである必要があり`ま`す。

    ![MKJQbI9THo4gQ3xQKuocGhBOnjg](/img/MKJQbI9THo4gQ3xQKuocGhBOnjg.png)

    例えば、キー`名`の値は`zilliz`で、キーproperties. resourceGuidの値は`d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`です。プライベートエンドポイントIDは`d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`である必要がありま`す。`

### エンドポイントを承認する{#authorize-your-endpoint}

Azureコンソールから取得したエンドポイントIDをZilliz Cloudの&#91;**エンドポイントID**&#93;ボックスに貼り付けます。&#91;**作成**&#93;をクリックします。

## プライベートリンクを取得する{#obtain-a-private-link}

送信した属性を確認して承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。この過程には約5分かかります。

プライベートリンクが準備できたら、Zilliz Cloudの**プライベートリンク**ページで閲覧可能です。

## DNSの設定{#set-up-dns}

Zilliz Cloudが割り当てたプライベートリンクを使用してクラスタをアクセス可能にする前に、DNSを設定する必要があります。

### AzureポータルでプライベートDNSゾーンを作成する{#create-a-private-dns-zone-on-the-azure-portal}

1. 作成したプライベートエンドポイントの&#91;**概要**&#93;ページで、&#91;**設定**&#93;&gt;&#91;**DNS構成**&#93;を選択し、プライベートエンドポイントとともに作成したネットワークインターフェイスの**IPアドレス**をコピーします。

    ![Ro6obryyhoNnVCxExrLcu97DnFb](/img/Ro6obryyhoNnVCxExrLcu97DnFb.png)

    上のスクリーンショットの値の例は**10.0.0.4。**

1. [[プライベートDNSゾーンの作成](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones)&#93;に移動し、&#91;**+作成**&#93;をクリックしてプロセスを開始します。

1. &#91;**基本**&#93;タブで、上記で使用したサブスクリプションとリソースグループを選択し、Zilliz CloudコンソールからコピーしたプライベートリンクURIを&#91;**インスタンス詳細**&#93;&gt;&#91;**名前**&#93;に貼り付けます。次に、&#91;**作成を確認**&#93;をクリックします。

    ![XD2TbAf62osTeRxQ2ZPcn1rQnkh](/img/XD2TbAf62osTeRxQ2ZPcn1rQnkh.png)

1. 検証が完了したら、作成をクリックして過程を開始します。

    ![LoMUbPFMkoO4EdxEAiScfOJ7nVf](/img/LoMUbPFMkoO4EdxEAiScfOJ7nVf.png)

1. デプロイが成功した場合、以下が表示されます。

    ![Vro4b1Yfbonb5QxGhvRccgginSd](/img/Vro4b1Yfbonb5QxGhvRccgginSd.png)

1. &#91;**リソースに移動**&#93;をクリックして、作成したプライベートDNSゾーンの**概要**ページを表示します。

    ![EhaqbNu1homiZRxUC8BcDSf3nHd](/img/EhaqbNu1homiZRxUC8BcDSf3nHd.png)

### プライベートDNSゾーンを仮想ネットワークにリンクする{#link-the-private-dns-zone-to-your-virtual-network}

1. 作成したプライベートDNSゾーンの&#91;概要&#93;ページで、左側のナビゲーションウィンドウの&#91;**設定**&#93;&gt;&#91;**DNSの管理**&#93;を選択します。

1. &#91;**+追加**&#93;をクリックします。&#91;**仮想ネットワークリンク**の追加&#93;ダイアログボックスで、**リンク名**を入力し、上記で使用した&#91;**サブスクリプション**と**仮想ネットワーク**&#93;を選択します。&#91;**構成**&#93;セクションで、&#91;**自動登録**も有効にする&#93;を選択します。

    ![NWyGbpkMXogi8kx5MLDciI1GnYf](/img/NWyGbpkMXogi8kx5MLDciI1GnYf.png)

    すべてが期待どおりに設定されたら、&#91;**OK**&#93;をクリックして続行します。デプロイが成功すると、作成された仮想ネットワークリンクのリンクステータスが&#91;**完了**&#93;に変わります。

    ![ZIbEbBZQho5R9jxelfncfpkjnEc](/img/ZIbEbBZQho5R9jxelfncfpkjnEc.png)

1. 左ナビゲーションウィンドウの**概要**をクリックして、プライベートDNSゾーンの**概要**ページに戻ります。

    ![AIzobdHXwoN0evxn1yRc9ooKnBf](/img/AIzobdHXwoN0evxn1yRc9ooKnBf.png)

1. &#91;**+レコードセット**&#93;をクリックします。&#91;**レコードセット追加**&#93;ダイアログボックスで、`名前`に-privatelinkを付けたクラスターIDを入力し、**タイプ**で**A-アドレスレコード**を**選択**し、**TTL**を**10分**に設定します。リストされたIPアドレスがメモしたものであるかどうかを確認してください。

    ![YJpzbctcJoiAz3xEAsTc7Rp2n6g](/img/YJpzbctcJoiAz3xEAsTc7Rp2n6g.png)

    &#91;**OK**&#93;をクリックしてレコードセットを保存します。

    ![IL9UbOvjaosxTqxp9XlcQGbdnmf](/img/IL9UbOvjaosxTqxp9XlcQGbdnmf.png)

1. Azure Portalで作成したプライベートエンドポイントの&#91;概要&#93;ページに戻ると、プライベートエンドポイントの**接続状態**が&#91;**保留中**&#93;から&#91;**承認済み**&#93;に変わります。

    ![Shh8b9DoWorTdOxksckcey6Cnch](/img/Shh8b9DoWorTdOxksckcey6Cnch.png)

    Azure仮想ネットワーク内のリソースは、Zilliz Cloudクラスターにプライベートでアクセス可能になりました。

## クラスタへのインターネットアクセスを管理する{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスターのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することができます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してクラスターにのみ接続できます。

パブリックエンドポイントを無効にするには:

1. ターゲットクラスタの**クラスタ詳細**ページに移動します。

1. &#91;**接続**&#93;セクションに移動します。

1. クラスターパブリックエンドポイントの横にある構成アイコンをクリックしてください。

1. 情報を読んで、**無効**にするをクリックして、**パブリックエンドポイントを無効**にするダイアログボックス。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>プライベートエンドポイントは<a href="/ja-JP/reference/restful/data-plane-v2">データプレーン</a>へのアクセスにのみ影響します。<a href="/ja-JP/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続きパブリックインターネットからアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、ローカルDNSキャッシュの有効期限が切れるまで、パブリックエンドポイントにアクセス可能にする必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

