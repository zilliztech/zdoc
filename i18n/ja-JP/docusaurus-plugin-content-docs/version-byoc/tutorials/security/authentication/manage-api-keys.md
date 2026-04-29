---
title: "API キー | BYOC"
slug: /manage-api-keys
sidebar_key: manage-api-keys
sidebar_label: "API キー"
beta: FALSE
notebook: FALSE
description: "API キーは、ユーザーやアプリケーションが Zilliz Cloud のコントロールプレーンおよびデータプレーンのリソースにアクセスするために API や SDK を呼び出す際の認証に使用されます。API キーは名前や ID などの固有のプロパティを持つ英数字の文字列です。| BYOC"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスター認証情報
  - api key

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# API キー

API キーは、ユーザーまたはアプリケーションが Zilliz Cloud のコントロールプレーンおよびデータプレーンのリソースにアクセスするために API または SDK 呼び出しを行う際の認証に使用されます。API キーは、名前や ID などの固有のプロパティを持つ英数字の文字列です。

## API キーの概要\{#overview-of-api-keys}

Zilliz Cloud は、多様なユーザー要件に対応するため、2 種類の API キーを提供しています。

- **個人 APIキー**: ユーザー登録時に自動的に生成され、各キーはユーザーのアカウントにリンクされており、そのユーザーが所属する組織およびプロジェクト内のユーザーのロールの特権を継承します。アカウントユーザーが組織を離れると、関連する個人キーは自動的に削除されます。**組織オーナー**または**プロジェクト管理者**として、Zilliz Cloud Web コンソールで 2 種類の個人 API キーを確認できます。

    - **あなた自身の個人 API キー**: あなただけに帰属する個人キーです。この API キーを表示およびコピーできます。

    - **メンバーの個人 API キー**: 組織またはプロジェクト内の他のユーザーに帰属する既存の個人キーの一覧です。これらのキーの名前と ID のみを表示でき、キー自体は表示できません。

- **カスタマイズされた API キー**: **組織オーナー**および**プロジェクト管理者**が、Zilliz Cloud アカウントを持たないアプリケーションまたは外部ユーザーのために手動で作成します。これらのキーは長期的なアクセスニーズに最適であり、API キーの初期作成者が組織を離れてもサービスの継続性を確保します。

<Admonition type="info" icon="📘" title="Notes">

<p>本番環境では、代わりにカスタマイズされたキーを使用してください。個人 API キーはユーザーアカウントとともに削除されます。</p>

</Admonition>

以下の図は、API キーのロールとリソースへのアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

以下の表は、割り当てられたロールに基づいた API キーのアクセス範囲の詳細を示しています。ロールと特権の詳細については、[アクセス制御](./access-control) を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>API キーのロール</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>組織オーナー</p></td>
     <td><p>プロジェクト、クラスター、ボリュームを含む組織内のすべてのリソースに対する完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>組織の請求管理者</p></td>
     <td><p>組織の請求のみに対する管理者アクセス。組織内のプロジェクト、クラスター、ボリュームへのアクセスはありません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>組織メンバー</p></td>
     <td><p>プロジェクト管理者</p></td>
     <td><p>指定されたプロジェクトに対する完全な管理者アクセス、およびデフォルトでプロジェクト内のすべてのクラスターとボリュームに対する完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読み書き</p></td>
     <td><p>指定されたプロジェクトに対する読み書きアクセス、およびデフォルトでプロジェクト内のすべてのクラスターとボリュームに対する読み書きアクセス。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読み取り専用</p></td>
     <td><p>指定されたプロジェクトに対する読み取り専用アクセス、およびデフォルトでプロジェクト内のすべてのクラスターとボリュームに対する読み取り専用アクセス。</p></td>
   </tr>
</table>

### 制限と制約\{#limits-and-restrictions}

- データ操作を実行するには、代わりにクラスター トークンを使用してください。有効なクラスター トークンは、コロンで区切られたクラスター ユーザー名とパスワード（例：`user:pass`）です。

- 各組織には、最大 100 個のカスタマイズされた API キーを含めることができます。

- API キーの管理権限は、組織およびプロジェクト内でのユーザーのロールに影響されます。具体的な権限は以下の通りです。

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>組織オーナー</strong></p></th>
         <th rowspan="2"><p><strong>組織の請求管理者</strong></p></th>
         <th colspan="3"><p><strong>組織メンバー</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>プロジェクト管理者</strong></p></td>
         <td><p><strong>プロジェクト読み書き</strong></p></td>
         <td><p><strong>プロジェクト読み取り専用</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>あなた自身の個人 API キー</strong></p></td>
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
         <td><p>✔️ </p></td>
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
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーの個人 API キー</strong></p></td>
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
         <td><p>名前と ID の表示</p></td>
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
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>カスタマイズされた API キー</strong></p></td>
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

## API キーの作成\{#create-an-api-key}

Zilliz Cloud が組織ユーザーごとに自動的に生成する個人キーとは別に、カスタマイズされたキーを作成できます。カスタマイズされた API キーを作成できるのは、**組織オーナー**および**プロジェクト管理者**のみです。

<Procedures>

1. 組織の**API キー**ページに移動します。**+ API キー**をクリックします。

    ![create-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/create-api-key.png "create-api-key")

1. **API キー名**を入力し、**API キーアクセス**を設定します。

    ![Nwd5bLDAuolLrUxo8nWcAHU5nub](https://zdoc-images.s3.us-west-2.amazonaws.com/nwd5bldauollruxo8nwcahu5nub.png "Nwd5bLDAuolLrUxo8nWcAHU5nub")

    - **API キー名**: 名前は 64 文字を超えないようにしてください。

    - **API キーアクセス**: 適切な組織およびプロジェクトのロールを割り当てることで、現在のカスタマイズされた API キーのアクセス範囲を定義します。よりきめ細かいアクセス制御を行うには、**特定のクラスターとボリュームへのアクセスを制限**をチェックすることで、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" icon="📘" title="Notes">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーが API キーに付与できる権限は、ユーザー自身の権限範囲に限定されます。</p>

        </Admonition>

</Procedures>

## API キーの表示\{#view-api-keys}

組織の**API キー**ページに移動します。表示内容は、特定の[ロール](./manage-api-keys#limits-and-restrictions)によって異なる場合があります。

- **組織オーナー**として、あなた自身の個人キー、すべてのメンバーの個人キー、およびすべてのカスタマイズされたキーを表示できます。

- **プロジェクト管理者**として、あなた自身の個人キー、メンバーの個人キー、およびあなたの権限範囲内にあるカスタマイズされたキーを表示できます。例えば、*ユーザー 1* が*プロジェクト A* のみのプロジェクト管理者であり、*キー 1* が*プロジェクト A*、*B*、*C* への管理者アクセスを持っている場合、*キー 1* のアクセス範囲が*ユーザー 1* の権限を超えているため、*ユーザー 1* には表示されません。

- **組織の請求管理者**、**プロジェクト読み書き**、または**プロジェクト読み取り専用**として、あなた自身の個人 API キーのみを表示できます。

以下のスクリーンショットは、**組織オーナー**による API キーの表示画面を示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](https://zdoc-images.s3.us-west-2.amazonaws.com/kkonbcca3o4qr9xjlhlcqmwinrd.png "KKONbcCa3o4qr9xJlhlcQMwinRd")

## API キーの編集\{#edit-an-api-key}

現在、編集できるのはカスタマイズされた API キーのみです。個人キーはアカウントユーザーに紐付いているため編集できません。個人キーのアクセス範囲を変更するには、まずユーザーの組織およびプロジェクトのロールを調整する必要があります。ユーザーのロールへの変更は、キーのアクセス権限に自動的に反映されます。

以下の手順では、カスタマイズされた API キーを編集する方法について説明します。

<Procedures>

1. 組織の**API キー**ページに移動します。アクション列の**...** をクリックし、**編集**をクリックします。

    ![edit-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-api-key.png "edit-api-key")

1. API キーの**API キー名**と**API キーアクセス**を編集します。

    ![JXeubHidbokaTax90eZcrmA9nIg](https://zdoc-images.s3.us-west-2.amazonaws.com/jxeubhidbokatax90ezcrma9nig.png "JXeubHidbokaTax90eZcrmA9nIg")

    - **API キー名**: 名前は 64 文字を超えないようにしてください。

    - **API キーアクセス**: 適切な組織およびプロジェクトのロールを割り当てることで、現在のカスタマイズされた API キーのアクセス範囲を定義します。よりきめ細かいアクセス制御を行うには、**特定のクラスターとボリュームへのアクセスを制限**をチェックすることで、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" icon="📘" title="Notes">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーが API キーに付与できる権限は、ユーザー自身の権限範囲に限定されます。</p>

        </Admonition>

</Procedures>

## API キーのリセット\{#reset-an-api-key}

個人またはカスタマイズされた API キーが侵害されたと考えられる場合は、直ちにリセットする必要があります。

<Admonition type="caution" icon="🚧" title="Warning">

<p>この操作により、現在の API キーがリセットされ無効になります。このキーを使用しているアプリケーションコードは、新しいキー値で関連コードを更新するまで機能しなくなります。</p>

</Admonition>

キーの種類によってプロセスは異なります。

- **個人 API キーのリセット**: ロールに関係なく、あなた自身の個人 API キーのみをリセットできます。

    ![reset-personal-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-personal-api-keys.png "reset-personal-api-keys")

- **カスタマイズされた API キーのリセット**: カスタマイズされた API キーをリセットできるのは、組織オーナーおよびプロジェクト管理者のみです。

    ![reset-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-customized-api-keys.png "reset-customized-api-keys")

## API キーの削除\{#delete-an-api-key}

カスタマイズされた API キーが不再用になった場合は、できるだけ早く削除してください。カスタマイズされた API キーを削除できるのは、**組織オーナー**および**プロジェクト管理者**のみです。

個人キーを手動で削除することはできません。ただし、対応するユーザーが組織を離れると、自動的に無効化され削除されます。

以下のスクリーンショットは、カスタマイズされた API キーを削除する方法を示しています。

<Admonition type="caution" icon="🚧" title="Warning">

<p>API キーを削除すると、そのキーを使用しているサービスによる Zilliz Cloud リソースへのアクセスが不可逆的に終了します。</p>

</Admonition>

![delete-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-customized-api-keys.png "delete-customized-api-keys")

## よくある質問\{#faq}

**本番環境で個人 API キーを使用すべきですか？**  

いいえ。**個人 API キー**は個々のユーザーアカウントに紐付いており、ユーザーが組織を離れると自動的に削除されます。キー所有者のアカウントが削除されると、そのキーに依存しているアプリケーションまたはサービスは即座に Zilliz Cloud リソースへのアクセスを失います。

本番環境では、代わりに**カスタマイズされた API キー**を使用してください。カスタマイズされたキーは個々のユーザーアカウントから独立しており、チームメンバーが組織を離れてもサービスの継続性を確保します。    

