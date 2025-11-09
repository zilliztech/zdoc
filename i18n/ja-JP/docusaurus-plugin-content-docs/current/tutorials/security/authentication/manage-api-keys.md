---
title: "APIキー | Cloud"
slug: /manage-api-keys
sidebar_label: "APIキー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "APIキーは、Zilliz CloudコントロールプレーンおよびデータプレーンリソースにアクセスするためのAPIまたはSDK呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前とIDなどの独自のプロパティを持つ英数字の文字列です。 | Cloud"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスターロredentials
  - apiキー
  - Chroma vs Milvus
  - Annoyベクトル検索
  - ミルヴス
  - Zilliz

---

import Admonition from '@theme/Admonition';


# APIキー

APIキーは、Zilliz CloudコントロールプレーンおよびデータプレーンリソースにアクセスするためのAPIまたはSDK呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前とIDなどの独自のプロパティを持つ英数字の文字列です。

## APIキーの概要\{#overview-of-api-keys}

Zilliz Cloudは、さまざまなユーザーの要求に応えるために2種類のAPIキーを提供します：

- **個人用APIキー**： ユーザー登録時に自動的に生成され、各キーはユーザーのアカウントにリンクされ、ユーザーが所属する組織とプロジェクト内のユーザーのロールの権限を継承します。アカウントユーザーが組織を離れると、 associated personal keyは自動的に削除されます。[組織オーナー](./organization-users#organization-roles)または[プロジェクト管理者](./project-users#project-roles)として、Zilliz Cloudウェブコンソールで2種類の個人用APIキーを表示できます：

    - **自分の個人用APIキー**： 専有の個人用キーです。このAPIキーを表示およびコピーできます。

    - **メンバーの個人用APIキー**： 組織またはプロジェクト内の他のユーザーに属する既存の個人用キーのリストです。これらのキーの名前とIDのみを表示することができ、キー自体は表示できません。

- **カスタマイズされたAPIキー**： Zilliz Cloudアカウントを持たないアプリケーションまたは外部ユーザーのために、**組織オーナー**および**プロジェクト管理者**が手動で作成します。これらのキーは、APIキーの初期作成者が組織を離れた場合でもサービスの連続性を確保するための長期的なアクセスニーズに理想的です。

以下の図は、APIキーのロールとリソースアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](/img/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

以下の表は、割り当てられたロールに基づいたAPIキーのアクセススコープの詳細を示しています。ロールと権限の詳細については、[アクセス制御](./access-control)を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>APIキーのロール</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>組織オーナー</p></td>
     <td><p>プロジェクトおよびクラスターを含む、組織内のすべてのリソースへの完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>組織請求管理者</p></td>
     <td><p>組織請求への管理者アクセスのみ。組織内のプロジェクトおよびクラスターにはアクセスできません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>組織メンバー</p></td>
     <td><p>プロジェクト管理者</p></td>
     <td><p>指定されたプロジェクトへの完全な管理者アクセス、およびデフォルトでプロジェクト内のすべてのクラスターへの完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読み書き</p></td>
     <td><p>指定されたプロジェクトへの読み書きアクセス、およびデフォルトでプロジェクト内のすべてのクラスターへの読み書きアクセス。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読み取り専用</p></td>
     <td><p>指定されたプロジェクトへの読み取り専用アクセス、およびデフォルトでプロジェクト内のすべてのクラスターへの読み取り専用アクセス。</p></td>
   </tr>
</table>

### 制度および制限\{#limits-and-restrictions}

- 各れの組織には最大100個のカスタマイズされたAPIキーを含めることができます。

- APIキーの管理権限は、組織およびプロジェクト内のユーザーのロールに影響されます。具体的な権限は以下の通りです：

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>組織オーナー</strong></p></th>
         <th rowspan="2"><p><strong>組織請求管理者</strong></p></th>
         <th colspan="3"><p><strong>組織メンバー</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>プロジェクト管理者</strong></p></td>
         <td><p><strong>プロジェクト読み書き</strong></p></td>
         <td><p><strong>プロジェクト読み取り専用</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>自分の個人用APIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>表示およびコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーの個人用APIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>名前とIDを表示</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>コピー</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>メンバーが組織を離れると自動的に削除</p></td>
         <td><p>メンバーが組織を離れると自動的に削除</p></td>
         <td><p>メンバーが組織を離れると自動的に削除</p></td>
         <td><p>メンバーが組織を離れると自動的に削除</p></td>
         <td><p>メンバーが組織を離れると自動的に削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>カスタマイズされたAPIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>表示およびコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## APIキーを作成\{#create-an-api-key}

Zilliz Cloudが各組織ユーザーのために自動的に生成する個人用キー以外に、カスタマイズされたキーを作成できます。**組織オーナー**および**プロジェクト管理者**のみがカスタマイズされたAPIキーを作成できます。

1. 組織の**APIキー**ページに移動します。**+ APIキー**をクリックします。

    ![create-api-key](/img/create-api-key.png)

1. **APIキー名**を入力し、**APIキーのアクセス**を構成します。

    ![BSdPbaXHdoIPp0xBsA0chg0onfL](/img/BSdPbaXHdoIPp0xBsA0chg0onfL.png)

    - **APIキー名**： 名前は64文字を超えないでください。

    - **APIキーのアクセス**： 遻切な組織およびプロジェクトロールを割り当てることで、現在のカスタマイズされたAPIキーのアクセススコープを定義します。きめ細かいアクセス制御のためには、**特定のクラスタへのアクセスを制限**にチェックを入れて、キーがアクセスできるクラスタを制限できます。

        <Admonition type="info" icon="📘" title="ノート">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限スコープに限定されます。</p>

        </Admonition>

## APIキーを表示\{#view-api-keys}

組織の**APIキー**ページに移動します。表示は、特定の[ロール](./manage-api-keys#limits-and-restrictions)により異なります。

- **組織オーナー**として、自分の個人用キー、すべてのメンバーの個人用キー、およびすべてのカスタマイズされたキーを表示できます。

- **プロジェクト管理者**として、自分の個人用キー、自分の権限スコープ内にあるメンバーの個人用キーおよびカスタマイズされたキーを表示できます。たとえば、*ユーザー1*が*プロジェクトA*のプロジェクト管理者のみで、*キー1*が*プロジェクトA*、*B*、および*C*への管理者アクセスを持っている場合、*キー1*のアクセススコープは*ユーザー1*の権限を超えているため、*ユーザー1*には*キー1*が表示されません。

- **組織請求管理者**、**プロジェクト読み書き**、または**プロジェクト読み取り専用**として、自分の個人用APIキーのみを表示できます。

以下のスクリーンショットは、**組織オーナー**のAPIキー表示を示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](/img/KKONbcCa3o4qr9xJlhlcQMwinRd.png)

## APIキーを編集\{#edit-an-api-key}

現在、カスタマイズされたAPIキーのみを編集できます。個人用キーはアカウントユーザーに結び付けられているため編集できません。個人用キーのアクセススコープを変更するには、まずユーザーの組織およびプロジェクトロールを調整する必要があります。ユーザーのロールに変更があると、キーのアクセス権限に自動的に反映されます。

以下の手順は、カスタマイズされたAPIキーを編集する方法を説明しています。

1. 組織の**APIキー**ページに移動します。アクション列の**...**をクリックし、**編集**をクリックします。

    ![edit-api-key](/img/edit-api-key.png)

1. APIキーの**APIキー名**および**APIキーのアクセス**を編集します。

    ![YqNtbRsyroP2cGxGLObcQgb7njh](/img/YqNtbRsyroP2cGxGLObcQgb7njh.png)

    - **APIキー名**： 名前は64文字を超えないでください。

    - **APIキーのアクセス**： 遻切な組織およびプロジェクトロールを割り当てることで、現在のカスタマイズされたAPIキーのアクセススコープを定義します。きめ細かいアクセス制御のためには、**特定のクラスタへのアクセスを制限**にチェックを入れて、キーがアクセスできるクラスタを制限できます。

        <Admonition type="info" icon="📘" title="ノート">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限スコープに限定されます。</p>

        </Admonition>

## APIキーをリセット\{#reset-an-api-key}

個人用またはカスタマイズされたAPIキーが漏洩していると考えられる場合は、すぐにリセットする必要があります。

<Admonition type="caution" icon="🚧" title="警告">

<p>この操作は、現在のAPIキーをリセットして無効にします。このキーを使用しているアプリケーションコードは、関連するコードを新しいキー値で更新するまで機能を停止します。</p>

</Admonition>

キーの種類に応じて、プロセスは異なります：

- **個人用APIキーをリセット**： 自分の個人用APIキーのみをリセットできます（ロールに関係なく）。

    ![reset-personal-api-keys](/img/reset-personal-api-keys.png)

- **カスタマイズされたAPIキーをリセット**： 組織オーナーおよびプロジェクト管理者のみがカスタマイズされたAPIキーをリセットできます。

    ![reset-customized-api-keys](/img/reset-customized-api-keys.png)

## APIキーを削除\{#delete-an-api-key}

カスタマイズされたAPIキーが使用されなくなった場合は、できるだけ速やかに削除する必要があります。**組織オーナー**および**プロジェクト管理者**のみがカスタマイズされたAPIキーを削除できます。

個人用キーは手動で削除できません。ただし、対応するユーザーが組織を離れると、自動的に無効化および削除されます。

以下のスクリーンショットは、カスタマイズされたAPIキーを削除する方法を示しています。

<Admonition type="caution" icon="🚧" title="警告">

<p>APIキーを削除すると、そのキーを使用しているサービスによるZilliz Cloudリソースへのアクセスが不可逆的に終了します。</p>

</Admonition>

![delete-customized-api-keys](/img/delete-customized-api-keys.png)