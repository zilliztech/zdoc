---
title: "Okta (SAML 2.0) | Cloud"
slug: /single-sign-on-with-okta
sidebar_label: "Okta (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Okta using the SAML 2.0 protocol. | Cloud"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - okta
  - Unstructured Data
  - vector database
  - IVF
  - knn

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Okta (SAML 2.0)

This topic describes how to configure single sign-on (SSO) with Okta using the SAML 2.0 protocol.

In this guide, Zilliz Cloud acts as the Service Provider (SP) and Okta acts as the Identity Provider (IdP). The following digram illustrates the necessary steps in Zilliz Cloud and Okta Admin Console.

![KywHwe7VIhcwsAbecTpcEsL3njb](https://zdoc-images.s3.us-west-2.amazonaws.com/KywHwe7VIhcwsAbecTpcEsL3njb.png)

## Before you start\{#before-you-start}

- Your Zilliz Cloud organization has at least one **Dedicated (Enterprise)** cluster.

- You have admin access to the Okta Admin Console. For more information, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm).

- You are the Organization Owner in the Zilliz Cloud organization where SSO is to be configured.

## Configuration steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

As the SP, Zilliz Cloud provides the **Audience URL (SP Entity ID)** and **Single sign-on URL** required when setting up your SAML app in Okta.

<Supademo id="cme6l0vit2298h3pyu26whujs" title="Step 1: Access service provider details in Zilliz Cloud console" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the dialog box that appears, choose **Okta (SAML 2.0)** as your IdP and protocol.

1. In the **Service Provider Details** card, copy your **Audience URL (SP Entity ID)** and **Single sign-on URL**. These values will be required in [Step 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console) when creating a SAML app in Okta Admin Console.

1. Once that's done, proceed to [Step 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console).

### Step 2: Create a SAML app in Okta Admin Console\{#step-2-create-a-saml-app-in-okta-admin-console}

In this step, you configure Okta (the IdP) with the SP details obtained from Zilliz Cloud.

<Supademo id="cmdh3bndv2ym06n9n9gx8epyd" title="Step 1: Create SAML App in Okta Admin Console" />

1. Log in to the [Okta Admin console](https://login.okta.com/).

1. In the left-side navigation pane, choose **Applications** > **Applications**.

1. Click **Create App Integration**.

1. In the **Create a new app integration** dialog box, select **SAML 2.0** and click **Next**.

1. For simplicity, set **App name** to **zilliz**, then click **Next**.

1. In the **General** area of the **Configure SAML** step, configure the fields below:

    - **Single sign-on URL**:

        - Paste the **Single sign-on URL** you copied from Zilliz Cloud console in [Step 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) here.

        - Be sure to **check the box** labeled **"Use this for Recipient URL and Destination URL"** to ensure correct routing during SAML requests.

    - **Audience URI (SP Entity ID)**: Paste the **Audience URL (SP Entity ID)** you copied from Zilliz Cloud console in [Step 1](./single-sign-on-with-okta#step-1-access-sp-details-in-zilliz-cloud-console) here.

1. In the **Attribute Statements (optional)** area, specify:

    - **Name**: Set the value to **email**.

    - **Value**: Select **user.email** from the drop-down list.

1. Click **Next**, then click **Finish**. You will be redirected to the app page.

1. On the **Sign On** tab of the app page, get **Metadata URL** and click **Copy**. It will be required in Zilliz Cloud console in [Step 3](./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console).

    <Admonition type="info" icon="📘" title="Notes">

    <p>Alternatively, click <strong>More details</strong> to get the following details:</p>
    <ul>
    <li><p><strong>Sign on URL</strong>: Copy the URL. It will be required in Zilliz Cloud console if the <strong>Manual</strong> mode is selected in <a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a>.</p></li>
    <li><p><strong>Signing Certificate</strong>: Click <strong>Download</strong> to save the certificate to your local computer. It will be required in Zilliz Cloud console if the <strong>Manual</strong> mode is selected in <a href="./single-sign-on-with-okta#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a>.</p></li>
    </ul>

    </Admonition>

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

In this step, you provide Okta’s IdP details back to Zilliz Cloud to complete the SAML trust relationship.

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="Step 2: Configure Okta Settings in Zilliz Cloud Console" />

1. Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the **Identity Provider Details** card of the **Configure Single Sign-On (SSO)** dialog box, paste the **Metadata URL** you copied from Okta Admin Console in [Step 2](./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console).

    <Admonition type="info" icon="📘" title="Notes">

    <p>Alternatively, if you select the <strong>Manual</strong> mode for IdP detail configuration, configure:</p>
    <ul>
    <li><p><strong>Sign On URL</strong>: Paste the <strong>Sign on URL</strong> you copied from Okta Admin Console in <a href="./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console">Step 2</a> here.</p></li>
    <li><p><strong>Signing Certificate</strong>: Upload the certificate you downloaded from Okta Admin Console in <a href="./single-sign-on-with-okta#step-2-create-a-saml-app-in-okta-admin-console">Step 2</a> here. Make sure the entire certificate content, including the lines beginning with <code>-----BEGIN CERTIFICATE-----</code> and ending with <code>-----END CERTIFICATE-----</code>, is provided.</p></li>
    </ul>

    </Admonition>

1. Once that's done, click **Save**.

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign SAML app to users\{#task-1-assign-saml-app-to-users}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="Task 1: Assign SAML App to Users" />

Before users can access Zilliz Cloud through SSO, you need to assign the Okta application to them:

1. On the app details page of the [Okta Admin console](https://login.okta.com/), click **Assignments**.

1. Choose **Assign** > **Assign to People**.

1. Assign the SAML app to the user and save the changes.

1. Click **Save** **and** **Go Back**.

Repeat for all users as needed. See [Okta documentation](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) for more.

### Task 2: Invite users to your project\{#task-2-invite-users-to-your-project}

When users log in to Zilliz Cloud via SSO for the first time, they are registered as an **Organization Member** but have no access to any project by default.

- The **Organization Owner** must invite them into the appropriate projects.

- For step-by-step instructions on how to invite users to a project, refer to [Manage Project Users](./project-users#invite-a-user-to-a-project).

After being invited to a project, the **Organization** **Owner** can share the Zilliz Cloud login URL with enterprise users so they can sign in through SSO.

If you encounter any issues during the setup or testing process, contact [Zilliz support](https://zilliz.com/contact-sales).

## FAQ\{#faq}

### What role is assigned to users who log in via SSO for the first time?\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

New users who do not already have a Zilliz Cloud account will be automatically created upon their first SSO login. These users are assigned the **Organization Member** role by default. You can modify their roles later in the Zilliz Cloud console. For detailed steps, refer to [Manage Project Users](./project-users#edit-a-collaborators-role-or-remove-a-collaborator).

### How do users access projects after SSO login?\{#how-do-users-access-projects-after-sso-login}

After logging in via SSO, users will have **Organization Member** role by default. To access specific projects, an **Organization Owner** or **Project Admin** must invite them to projects. For detailed steps, see [Manage Project Users](./project-users).

### What happens if a user already has a Zilliz Cloud account before logging in with SSO?\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

If the user already exists in your Zilliz Cloud organization (based on their email), they will retain their original role and permissions when logging in via SSO. The system matches users by email address and does not overwrite existing accounts.

### Can I configure multiple SSO providers for the same organization?\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

Currently, each Zilliz Cloud organization supports only **one active SAML SSO configuration** at a time.