---
title: "Manage Volumes (Console) | Cloud"
slug: /manage-volumes-via-console
sidebar_label: "Manage Volumes (Console)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page describes how to manage volumes using the web console. | Cloud"
type: origin
token: JwYYw2v0yi2eHBkFZuJcM7pXnnc
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - volume
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage Volumes (Console)

This page describes how to manage volumes using the web console.

<Admonition type="info" icon="📘" title="Note">

<p>You can only create volumes on AWS and Google Cloud. If you need to use a volume on Azure, please <a href="http://support.zilliz.com">contact support</a>.</p>

</Admonition>

## Create a volume\{#create-a-volume}

If you only want to try out the volume feature, create a **free trial volume**. A free trial volume can be created **once per organization** and has limits on capacity and file uploads. For details, see [Volume Explained](./volume-explained#billing).

For production workloads, create a **pay-as-you-go volume**.

The following table describes each parameter used when creating a volume.

<table>
   <tr>
     <th><p><strong>Parameter</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Name</p></td>
     <td><p>The volume name must be unique across the organization, no longer than 64 characters, start with a letter or underscore, and contain only letters, digits, hyphens, and underscores.</p></td>
   </tr>
   <tr>
     <td><p>Description</p></td>
     <td><p>This parameter is optional.</p></td>
   </tr>
   <tr>
     <td><p>Cloud Provider &amp; Region</p></td>
     <td><p>The volume cloud provider and region must match the cloud provider and region of the target cluster you plan to import or migrate data into.</p></td>
   </tr>
</table>

<Supademo id="cmi76tseu4ok8b7b4l5nods0s?utm_source=link" title=""  />

## View volumes\{#view-volumes}

You can view the list of volumes in a project and inspect the details of a specific volume by clicking on the volume name.

![Ar8zbXfHQoQCaQxnKU4c34ednSh](https://zdoc-images.s3.us-west-2.amazonaws.com/ar8zbxfhqoqcaqxnku4c34ednsh.png "Ar8zbXfHQoQCaQxnKU4c34ednSh")

## Manage files or folders in a volume\{#manage-files-or-folders-in-a-volume}

You can upload, view, and delete files or folders stored in a volume.

### Upload a file or folder\{#upload-a-file-or-folder}

Uploading files or folders to a volume from the web console is currently **not supported**. Use the SDKs instead. See [Manage Volumes (SDK)](./manage-stages#upload-data-into-a-volume).

### View files and folders\{#view-files-and-folders}

You can browse the existing files and folders in a volume.

![UOT3bP88no57f8xNqmYcjFwXnFh](https://zdoc-images.s3.us-west-2.amazonaws.com/uot3bp88no57f8xnqmycjfwxnfh.png "UOT3bP88no57f8xNqmYcjFwXnFh")

### Delete a file or folder\{#delete-a-file-or-folder}

If you no longer need a file or folder, you can delete it from the volume. Deletion may take several minutes, depending on the size of the file or folder.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Deleted files and folders <strong>cannot be recovered</strong>. Proceed with caution.</p>

</Admonition>

<Supademo id="cmidzfkoqad9sb7b44vnbfzyd?utm_source=link" title=""  />

## Delete a volume\{#delete-a-volume}

You can delete a volume at any time if it is no longer needed. Note that the free trial volume can only be created once per organization. Once deleted, you can no longer create any free trial volume.

Deleting a volume removes **all its files and folders** as well.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Deleted volumes <strong>cannot be recovered</strong>. Proceed with caution.</p>

</Admonition>

<Supademo id="cmi77c5554p1gb7b4sqqsm7nn?utm_source=link" title=""  />

