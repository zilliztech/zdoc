---
title: "FAQ：ユーザーとロール | CLOUD"
slug: /faq-users-and-roles
sidebar_label: "FAQ：ユーザーとロール"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud上でユーザー、ロール、およびアクセスに関する問題に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 8

---

# FAQ：ユーザーとロール

このトピックでは、Zilliz Cloud上でユーザー、ロール、およびアクセスに関する問題に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。

## 目次

- [組織を離脱できますか？](#can-i-leave-my-organization)
- [組織名を編集するには？](#how-can-i-edit-my-organization-name)
- [同僚やチームメイトを招待して共同作業するには？](#how-can-i-invite-a-colleague-or-teammate-to-collaborate)
- [特定の権限またはカスタム権限グループを持つロールを作成できますか？](#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups)

## FAQ

### 組織を離脱できますか？\{#can-i-leave-my-organization}

組織メンバーである場合、自由に組織を離脱できます。

組織所有者である場合、組織内に最後の所有者でない場合にのみ組織を離脱できます。組織には少なくとも1人の所有者がいなければならず、組織内に唯一の所有者がいる場合は離脱できません。

### 組織名を編集するには？\{#how-can-i-edit-my-organization-name}

1. 組織を選択します。

1. 左側のナビゲーションで**設定**をクリックします。

1. **組織** **設定**ページの**組織情報**セクションで、**編集**をクリックします。

1. 新しい組織名を入力し、**確認**をクリックします。

1. 組織名が正常に変更されたというメッセージが表示されます。

### 同僚やチームメイトを招待して共同作業するには？\{#how-can-i-invite-a-colleague-or-teammate-to-collaborate}

組織所有者である場合、ユーザーを組織に招待できます。より詳細な手順については、[組織ユーザーの管理](./organization-users)を参照してください。

組織メンバーである場合は、組織所有者に連絡して他のユーザーを招待してもらってください。

さらに、Zilliz Cloudはプロジェクトへのユーザー招待もサポートしています。プロジェクト管理者である場合は、他のプロジェクトユーザーをプロジェクトに招待できます。より詳細な手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### 特定の権限またはカスタム権限グループを持つロールを作成できますか？\{#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups}

はい。最初に[サポートチケットを作成](http://support.zilliz.com)する必要があり、これによりこの機能を有効にできます。この機能が有効になると、SDKを使用してこのタスクを完了できます。詳細については、[権限と権限グループ](./cluster-privileges#custom-privilege-groups)を参照してください。