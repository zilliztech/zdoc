---
slug: /manage-connectors
beta: FALSE
notebook: FALSE
type: origin
token: IcelwKDHsiUEEPkOPb5cgYO9n5f
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Connector

Managing connectors efficiently is integral to maintaining a smooth data integration process. This guide provides detailed instructions on how to manage connectors.

## Enable or disable a connector{#enable-or-disable-a-connector}

1. Locate the connector you want to manage.

1. Click __...__ under __Actions__.

1. Choose __Enable__ or __Disable__.

<Admonition type="info" icon="📘" title="Notes">

<p>To activate a connector, ensure the target pipelines are configured. For more information, refer to step 3 in <a href="./create-connectors">Create Connectors</a>.</p>

</Admonition>

![enable-connector](/img/enable-connector.png)

## Trigger a manual scan{#trigger-a-manual-scan}

Perform a manual scan if the auto scan feature is off. 

Click "__...__" under __Actions__ next to the target connector, then click __Scan__.

<Admonition type="info" icon="📘" title="Notes">

<p>Ensure the connector is enabled before initiating a manual scan.</p>

</Admonition>

## Configure a connector{#configure-a-connector}

You can modify the following settings of a connector:

- Storage bucket access credentials:

    - (For AWS S3) access key and secret key

    - (For Google Cloud Storage) access key ID and secret access key

- Auto scan schedule. For more information, refer to step 4 in [Create Connectors](./create-connectors).

![configure-connector](/img/configure-connector.png)

## Drop a connector{#drop-a-connector}

You can drop a connector if it is no longer necessary.

<Admonition type="info" icon="📘" title="Notes">

<p>The connector must be disabled before being dropped.</p>

</Admonition>

![drop-connector](/img/drop-connector.png)

## View connector logs{#view-connector-logs}

Monitor connector activities and troubleshoot issues:

1. Access the connector's activity page to view logs.

    ![view-connector-logs](/img/view-connector-logs.png)

1. An `abnormal` status indicates an error. Click the "?" icon next to the status for detailed error messages.

