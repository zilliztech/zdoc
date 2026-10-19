---
title: "PingOne (SAML 2.0) | Cloud"
slug: /single-sign-on-with-ping-one
sidebar_label: "PingOne (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Ping Identity (PingOne) using the SAML 2.0 protocol. | Cloud"
type: origin
token: KIPiw0RqSieKkjkACwGcvgfLnSe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# PingOne (SAML 2.0)

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only with the Enterprise plan or higher, and BYOC deployments.

</FeatureNote>

This topic describes how to configure single sign-on (SSO) with Ping Identity (PingOne) using the SAML 2.0 protocol.

In this guide, Zilliz Cloud acts as the Service Provider (SP) and PingOne acts as the Identity Provider (IdP). You copy SP details from Zilliz Cloud to a PingOne SAML application, then provide the application's IdP details to Zilliz Cloud.

## Before you start\{#before-you-start}

- You are the **Organization Owner** in the Zilliz Cloud organization where SSO is to be configured.

- You have administrator permissions in PingOne to create and configure SAML applications and manage user access. Creating an environment also requires the **Organization Admin** role or equivalent permissions.

## Configuration steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

Zilliz Cloud provides the **Entity ID** and Assertion Consumer Service (**ACS URL**) required to create the SAML application in PingOne.

<Supademo id="cmu4vnhpi254fqm3bxz83ierb" title=""  />

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. Find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the dialog box that appears, choose **Ping Identity (SAML 2.0)**.

1. In the **Service Provider Details** card, copy the **Entity ID** and **ACS URL**. Keep this page open while you configure PingOne in another browser tab.

    <Admonition type="info" title="Notes">

    Copy both values from your organization's console. Do not substitute values from another organization or environment.

    </Admonition>

</Procedures>

### Step 2: Create a SAML app in PingOne\{#step-2-create-a-saml-app-in-pingone}

Configure PingOne with the SP details from [Step 1](./single-sign-on-with-ping-one#step-1-access-sp-details-in-zilliz-cloud-console), then configure the email attributes that Zilliz Cloud uses to identify users.

<Supademo id="cmu4wguf625pmqm3bbuwhimr4" title=""  />

<Procedures>

1. Log in to the [PingOne admin console](https://www.pingidentity.com/bin/ping/signOnLink). Select an existing environment with the **PingOne SSO** service, or [create a new environment](https://docs.pingidentity.com/pingone/settings/p1_addenvironment.html) with **Workforce solution**.

1. Go to **Applications > Applications** and click the **+** icon.

1. Enter an **Application Name**, such as `zilliz-sso`. Select **SAML Application** and click **Configure**.

1. Select **Manually Enter** and enter the following SP details.

    | PingOne field | Value from Zilliz Cloud |
    | --- | --- |
    | **ACS URLs** | The **ACS URL** copied in [Step 1](./single-sign-on-with-ping-one#step-1-access-sp-details-in-zilliz-cloud-console). |
    | **Entity ID** | The **Entity ID** copied in [Step 1](./single-sign-on-with-ping-one#step-1-access-sp-details-in-zilliz-cloud-console). |

1. Click **Save** to create the application.

1. On the application's **Configuration** tab, click the pencil icon. Set **Subject NameID Format** to `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`, then click **Save**.

1. On the **Attribute Mappings** tab, click the pencil icon. Change the existing `saml_subject` mapping and click **Add** to create the `email` mapping shown below.

    | Application attribute | PingOne mapping | Purpose |
    | --- | --- | --- |
    | `saml_subject` | **Email Address** | Sets the SAML NameID value to the user's email address. |
    | `email` | **Email Address** | Provides the email attribute that Zilliz Cloud uses to match the user account. |

1. Select **Required** for the `email` mapping. The `saml_subject` mapping is already required and its checkbox cannot be changed. Click **Save**.

1. Turn on the toggle at the top of the application's details panel to enable the application.

1. On the **Overview** tab, locate **Connection Details**. Copy the **IDP Metadata URL** for use in [Step 3](./single-sign-on-with-ping-one#step-3-configure-idp-settings-in-zilliz-cloud-console).

    <Admonition type="info" title="Notes">

    Configure both email mappings. Setting the NameID format alone does not populate the `email` attribute.
    
    Enable the PingOne application before importing its metadata into Zilliz Cloud. A disabled application's metadata URL can return `404`, causing the import to fail.

    </Admonition>

    If you prefer a file, click **Download Metadata** to download the metadata XML. For manual configuration, copy **Single Signon Service** from **Connection Details** and download the **Signing Certificate**. Choose **X509 PEM (.crt)** as the certificate format.

</Procedures>

For details about PingOne application settings, see [Adding an application](https://docs.pingidentity.com/pingone/applications/p1_applications_add_applications.html) and [Editing an application - SAML](https://docs.pingidentity.com/pingone/applications/p1_edit_application_saml.html).

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

<Supademo id="cmu4wrh3q264fqm3bnanweoky" title=""  />

<Procedures>

1. Return to the **Configure Single Sign-On (SSO)** dialog box in Zilliz Cloud. In the **Identity Provider Details** card, use one of the following methods.

    | Method | What to enter in Zilliz Cloud |
    | --- | --- |
    | **Metadata URL/File**: URL | Paste the **IDP Metadata URL** copied from PingOne into **IDP Metadata URL**. |
    | **Metadata URL/File**: XML file | Click **Upload file** and upload the XML obtained with **Download Metadata**. |
    | **Manual** | Paste the PingOne **Single Signon Service** URL into **Single Signon Service**. Paste or upload the PingOne signing certificate into **Signing Certificate**. |

    Use the metadata URL for the shortest setup. Choose the XML file if you prefer to upload metadata, or use **Manual** to provide the login URL and certificate separately.

    <Admonition type="info" title="Notes">

    For manual configuration, include the complete PEM certificate, including `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`.
    
    Zilliz Cloud accepts certificate uploads with `.pem`, `.cer`, or `.cert` extensions. If PingOne downloads an X509 PEM certificate as `.crt`, paste its contents or rename the extension to `.pem` before uploading. Renaming a binary certificate does not convert it to PEM.

    </Admonition>

1. After entering the IdP details, click **Save**. When the **SSO Configured Successfully** dialog box appears, click **OK**.

1. In the organization's **Single Sign-On (SSO)** section, ensure SSO is enabled.

    Saving the configuration does not verify that a user can sign in. Complete the following tasks before enabling SSO enforcement.

</Procedures>

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Configure user access in PingOne\{#task-1-configure-user-access-in-pingone}

Check who can access the application before sharing the SSO login with users.

<Supademo id="cmu4xe96v26tcqm3blkn6wj78" title=""  />

<Procedures>

1. In PingOne, go to **Applications > Applications** and open your Zilliz Cloud application.

1. On the **Access** tab, click the pencil icon.

1. Under **Group Membership Policy**, select the groups that should access Zilliz Cloud. If you select multiple groups, choose whether users must belong to any or all applied groups.

1. Review the **Admin Only Access** setting. Leave **Must have admin role** cleared if non-administrator users need access.

1. Click **Save** and ensure your test user belongs to the required groups.

    If no groups are applied, group membership is not required to access the application. For details, see PingOne's [Application access control](https://docs.pingidentity.com/pingone/applications/p1_application_access_control.html).

</Procedures>

### Task 2: Test SSO and grant project access\{#task-2-test-sso-and-grant-project-access}

<Procedures>

1. In the Zilliz Cloud console, go to your organization's **Settings** page. In the **Single Sign-On (SSO)** card, copy the **Login URL** and open it in a private browser window.

    ![I3wHbrMdooQQs8xKgfycVs2dnXc](https://zdoc-images.s3.us-west-2.amazonaws.com/i3whbrmdooqqs8xkgfycvs2dnxc.png "I3wHbrMdooQQs8xKgfycVs2dnXc")

1. Authenticate in PingOne as the test user. Verify that you return to Zilliz Cloud and can access the intended organization.

1. Have an **Organization Owner** or **Project Admin** grant the user access to the required project. For instructions, see [Manage Platform Users](./manage-platform-users).

1. Verify that the user can open the project and perform the actions allowed by their assigned role.

</Procedures>

New users are created when they first sign in through SSO. Organization membership does not automatically grant project access. Existing users with matching email addresses retain their roles and permissions.

After testing succeeds, share your organization's Zilliz Cloud SSO login URL with the users who have access to the PingOne application.

### Task 3: (Optional) Enable SSO enforcement\{#task-3-optional-enable-sso-enforcement}

After the connection is configured and intended users can sign in successfully, you can enable **SSO enforcement** to require SSO for non-exempt organization members.

<Admonition type="warning" title="Warning">

Enabling SSO enforcement invalidates active sessions for non-exempt members and blocks their non-SSO login methods. Review the Organization Owner exemption rules and other effects before enabling it.

</Admonition>

For instructions and exemption rules, see [Enforce SSO in Your Organization](./enforce-sso-in-your-organization).

## FAQ\{#faq}

### Why does importing the metadata URL fail?\{#why-does-importing-the-metadata-url-fail}

First, check that the PingOne application is enabled. A disabled application can return `404` for its metadata URL. Copy **IDP Metadata URL** again from that application's **Overview > Connection Details** and retry. If URL import still fails, download the metadata XML and use the file upload option.

### What should I check if a user cannot sign in?\{#what-should-i-check-if-a-user-cannot-sign-in}

- Check that the PingOne application and Zilliz Cloud SSO are both enabled.

- Compare PingOne's **ACS URLs** and **Entity ID** with the values shown in the target Zilliz Cloud organization.

- Check that **Subject NameID Format** is `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` and both `saml_subject` and `email` map to **Email Address**.

- Verify that the PingOne user has an email address. For an existing Zilliz Cloud account, the email addresses must match.

- Check the application's **Access** settings and the user's group membership.

- For manual configuration, check that the URL is **Single Signon Service** and that the complete signing certificate belongs to the same PingOne application.

### Why can a user sign in but not access a project?\{#why-can-a-user-sign-in-but-not-access-a-project}

SSO authentication and project authorization are separate. Grant the user the appropriate project role as described in [Manage Platform Users](./manage-platform-users).

### What happens if the user already has a Zilliz Cloud account?\{#what-happens-if-the-user-already-has-a-zilliz-cloud-account}

Zilliz Cloud matches the user by email address. If the user already belongs to the organization with that email address, their existing roles and permissions are retained.

### Can I configure multiple SSO providers for the same organization?\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

Each Zilliz Cloud organization supports only **one active SAML SSO configuration** at a time.