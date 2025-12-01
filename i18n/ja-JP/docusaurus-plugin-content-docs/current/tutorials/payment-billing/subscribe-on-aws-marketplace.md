---
title: "AWSマーケットプレイスで登録 | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWSマーケットプレイス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、AWSマーケットプレイスでの登録プロセスのステップバイステップガイドを提供し、Zilliz Cloudの価格用語を概説します。 | Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 3
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - マーケットプレイス
  - aws
  - ベクトル化
  - k最近傍アルゴリズム
  - anns
  - ベクター検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# AWSマーケットプレイスで登録

このガイドでは、登録プロセスのステップバイステップガイドを提供し、AWSマーケットプレイスでのZilliz Cloudの価格用語を概説します。

<Admonition type="info" icon="📘" title="注意">

<p>登録後、AWSクラスターの使用量はAWSマーケットプレイス経由で支払えます。他のクラウドプロバイダーにデプロイされているクラスターがある場合も、AWSマーケットプレイスを使用して支払えます。</p>

</Admonition>

## 事前準備\{#before-you-start}

- AWSマーケットプレイスアカウントがあることを確認してください。

- AWS購入者IDのデフォルト支払い方法を請求プランに設定します。[デフォルト支払い方法を変更する方法](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html)を参照してください。

- 既存のZilliz Cloudユーザーの場合は、AWSマーケットプレイスでの登録に別のメールアドレスを使用してください。

- AWSアカウントが組織に属している場合、請求管理者による購入の承認を受ける必要があります。

## AWSマーケットプレイスで登録\{#subscribe-on-aws-marketplace}

<Supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title="Zilliz Cloud - AWSマーケットプレイス登録デモ" />

[AWSマーケットプレイス](https://aws.amazon.com/marketplace)にアクセスし、以下のようにZilliz Cloudに登録を開始します：

1. 検索ボックスで**Zilliz Cloud**を検索するか、[AWSマーケットプレイスに移動](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz)してZilliz Cloudポータルページを表示します。

    ![search_for_zilliz_on_aws](/img/search_for_zilliz_on_aws.png)

1. **Zilliz Cloud**をクリックします。

    サービスおよび価格を確認してください。

    Zilliz Cloudを既に使用している場合は、**購入オプションを表示**をクリックします。

    Zilliz Cloudを以前に使用したことがない場合は、**無料で試す**をクリックできます。これはAWSが提供する30日間の無料トライアルです。無料トライアルが終了すると、Zilliz Cloudの使用を継続するには[サブスクリプションを有料にアップグレード](./subscribe-on-aws-marketplace#upgrade-to-paid-subscription-from-free-trial)する必要があります。

    ![view_purchase_options](/img/view_purchase_options.png)

1. ペラグを下げて**登録**をクリックします。

    ![aws_flash_message](/img/aws_flash_message.png)

1. プロンプトに従ってZilliz Cloudで**アカウントを設定**します。

    ![set-up-account](/img/set-up-account.png)

1.  新しいタブで、以下の手順に従って登録を完了してください。

    1. すでにZilliz Cloudアカウントをお持ちの場合は、 simplyログインしてください。そうでない場合は、[登録オプション](./register-with-zilliz-cloud)を選択してプロセスに従ってください。AWS IDをZilliz Cloudアカウントに関連付けるために、URL内のすべてのクエリ文字列が保持されるようにしてください。

        <Admonition type="info" icon="📘" title="注意">

        <p>AWSマーケットプレイスは、URL内のクエリ文字列を使用してID情報をZilliz Cloudに渡します。登録に失敗すると、これらのクエリ文字列が失われる可能性があります。その結果、Zilliz CloudがAWS IDを登録したアカウントに関連付けることができなくなる可能性があります。その場合は、AWSマーケットプレイスに戻って<b>アカウント設定</b>を再度クリックしてください。</p>

        </Admonition>

    1. 登録を既存のZilliz Cloud組織に関連付けます。

        ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

    1. 承認を完了します。

1. **請求**に移動して、AWSマーケットプレイス登録が支払い方法として設定されていることを確認します。

    ![aws-marketplace-success](/img/aws-marketplace-success.png)

## 無料トライアルから有料登録にアップグレード\{#upgrade-to-paid-subscription-from-free-trial}

AWSマーケットプレイスでZilliz Cloudの無料トライアルを開始すると、通常のZilliz Cloud無料トライアルと同じ機能が提供されます。詳細については、[Zilliz Cloudを無料でお試し](./free-trials#free-trial)を参照してください。

無料トライアル期間中、**請求概要**ページのAWSマーケットプレイス登録の横に`無料トライアル`タグが表示されます。

より高度な機能については、いつでも有料AWS登録にアップグレードできます。アップグレードするには、前のセクションで説明した通常の登録プロセスに従ってください。[デモ](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace)はこちら。

1. AWSマーケットプレイスの[Zilliz Cloudページ](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa)に移動します。

1. **購入オプションを表示**をクリックします。

1. ペラグを下げて**登録**をクリックします。

1. プロンプトで**アカウントを設定**をクリックします。

1. Zilliz Cloudアカウントにログインし、AWSマーケットプレイス登録をZilliz Cloud組織に関連付けます。

アップグレードが成功したかどうかは、**請求概要**ページの**支払い方法**カードで確認できます。AWSマーケットプレイス登録の横の`無料トライアル`タグが消えた場合、アップグレードは成功しています。

## AWSマーケットプレイス登録を更新\{#update-aws-marketplace-subscription}

AWSマーケットプレイスから正常に登録した後、いつでも都合の良いときに登録を更新できます。具体的には、登録に使用されているAWSマーケットプレイスアカウントを別のアカウントに変更するか、AWSマーケットプレイス登録からクレジットカードへの支払い方法を切り替えることができます。

### AWSマーケットプレイス登録アカウントを変更\{#change-aws-marketplace-subscription-account}

1. 登録に使用した元のAWSアカウントでAWSマーケットプレイスにサインインします。

1. Zilliz Cloud登録をキャンセルします。詳細については、[プロダクト登録をキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription)を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    <p>登録をキャンセルしても、Zilliz Cloudデータは削除されませんのでご安心ください。</p>

    </Admonition>

    AWSマーケットプレイスによるキャンセル処理には数分かかります。

1. 元のAWSアカウントからサインアウトします。

1. 登録に使用する新しいAWSアカウントでAWSマーケットプレイスにサインインします。

1. [AWSマーケットプレイスで登録](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace)セクションの手順1～4に従って、新しいアカウントでZilliz Cloudへの登録を完了します。

    <Admonition type="info" icon="📘" title="注意">

    <p>AWSマーケットプレイス登録を更新する際は、Zilliz Cloud組織に新しい登録を関連付けるために<strong>アカウント設定</strong>ボタンをクリックする必要があります。</p>

    </Admonition>

1. **請求概要**ページの**支払い方法**セクションで更新を確認します。登録IDをクリックして、登録**アカウントID**が新しいマーケットプレイスアカウントに更新されたことを確認します。

    ![view-aws-subscription-id](/img/view-aws-subscription-id.png)

<Admonition type="info" icon="📘" title="注意">

<p>サービスの中断を避けるため、1時間以内に操作を完了することを推奨します。</p>

</Admonition>

### 支払いクレジットカードに切り替える\{#switch-to-payment-credit-card}

<Supademo id="cm9i80zwc26e2ljv56y6iydeu" title="Zilliz Cloud - 支払い方法変更デモ" />

1. 登録に使用した元のAWSアカウントでAWSマーケットプレイスにサインインします。

1. Zilliz Cloud登録をキャンセルします。詳細については、[プロダクト登録をキャンセル](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription)を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    <p>登録をキャンセルしても、Zilliz Cloudデータは削除されませんのでご安心ください。</p>

    </Admonition>

    AWSマーケットプレイスによるキャンセル処理には数分かかります。

1. [支払い方法を追加](./subscribe-by-adding-credit-card#add-a-credit-card)の手順に従って、支払い用クレジットカードを追加します。

1. **請求概要**ページの**支払い方法**セクションで更新を確認します。

## AWSマーケットプレイス登録をキャンセル\{#cancel-aws-marketplace-subscription}

AWSマーケットプレイス登録をキャンセルするには、AWSマーケットプレイスコンソールを開き、[AWSガイドの指示](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html)に従ってください。

## AWSマーケットプレイス価格用語\{#aws-marketplace-pricing-terms}

詳細については、[支払いと請求](./payment-billing#marketplace-pricing-terms)を参照してください。

## トラブルシューティング\{#troubleshooting}

**マーケットプレイス登録をZilliz Cloudにリンクする際に利用可能な組織がない場合どうすればよいですか？**

考えられる理由はいくつかあります。

1. **権限不足**

    これは、十分な権限がない場合に発生する可能性があります。利用不可の組織の横に**"権限が不足しています"**タグが表示されます。

    ![insufficient-permission-subscription](/img/insufficient-permission-subscription.png)

    組織をマーケットプレイス登録に関連付けるには、**組織オーナー**または**組織請求管理者**である必要があります。組織メンバーだけの場合は、必要な権限がありません。組織オーナーに支援を依頼してください。

1. **すべての組織が既にマーケットプレイス登録と正常にリンクされている**

    これは、すべての組織が既にマーケットプレイス登録に関連付けられている場合に発生する可能性があります。利用不可の組織の横に**"マーケットプレイスリンク済み"**タグが表示されます。

    ![marketplace-already-linked-subscription](/img/marketplace-already-linked-subscription.png)

    この場合、

    1. 既存のマーケットプレイス登録を更新する必要がある場合は、まず組織の現在のマーケットプレイス登録を[リンク解除](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription)し、次に新しい登録を設定してください。

    1. 異なるマーケットプレイス登録用に複数の組織が必要な場合は、以下を行うことができます：

        1. [登録](./register-with-zilliz-cloud)して新しいZilliz Cloudアカウントを作成し、新しい組織を作成します。次に、組織オーナーを新しい組織に[招待](./organization-users#invite-a-user-to-your-organization)します。この組織オーナーは複数の組織に属し、各組織に異なるマーケットプレイス登録を設定できます。

        1. [サポートチケットを作成](http://support.zilliz.com)して、新しい組織を作成してもらいます。現在、Zilliz Cloudではユーザーによる組織の手動作成はサポートされていません。

1. **リストに組織がない**

    これは、アカウントが閉鎖されたか、すべての組織から退出した場合に発生する可能性があります。UIは以下のようになります。

    ![no-organization-during-subcription](/img/no-organization-during-subcription.png)

    この場合、以下を行うことができます：

    - 新しい組織を作成します。

    - 他のユーザーに[招待](./organization-users#invite-a-user-to-your-organization)されて組織に参加してもらい、組織オーナーのロールを付与してもらいます。

    - [サポートチケットを送信](https://support.zilliz.com/hc/en-us)して、新しい組織を作成してもらいます。

## 関連トピック\{#related-topics}

- [クレジットカードを追加して登録](./subscribe-by-adding-credit-card)

- [Azureマーケットプレイスで登録](./subscribe-on-azure-marketplace)

- [GCPマーケットプレイスで登録](./subscribe-on-gcp-marketplace)

- [請求書を表示](./view-invoice)

