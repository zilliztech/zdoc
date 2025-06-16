# Function

A `Function` instance for generating vector embeddings from user-provided raw data or applying a reranking strategy to the search results in Milvus.

```python
class pymilvus.Function
```

## Constructor

This constructor initializes a new `Function` instance designed to transform user's raw data into vector embeddings or applying a reranking strategy to the search results. This is achieved through an automated process that simplifies similarity search operations.

```python
Function(
    name: str,
    function_type: FunctionType,
    input_field_names: Union[str, List[str]],
    output_field_names: Union[str, List[str]],
    description: str = "",
)
```

**PARAMETERS:**

- `name` (*str*) -

    **[REQUIRED]**

    The name of the function. This identifier is used to reference the function within queries and collections.

- `function_type` (*FunctionType*) -

    **[REQUIRED]**

    The type of embedding function to use. Possible values:

    - `FunctionType.BM25`: Generates sparse vectors based on the BM25 ranking algorithm from a `VARCHAR` field.

    - `FunctionType.TEXTEMBEDDING`: Generates dense vectors that capture semantic meaning from a `VARCHAR` field.

    - `FunctionType.RERANK`: Applies reranking strategies to the search results.

- `input_field_names` (*Union[str, List[str]]*) -

    **[REQUIRED]**

    The name of the field containing the raw data that requires conversion to a vector representation. This parameter accepts only one field name.

- `output_field_names` (*Union[str, List[str]]*) -

    The name of the field where the generated embeddings will be stored. This should correspond to a vector field defined in the collection schema. This parameter accepts only one field name.

    <div class="admonition note">

    <p><b>notes</b></p>

    <p>This applies only when you set <code>function_type</code> to <code>FunctionType.BM25</code> and <code>FunctionType.TEXTEMBEDDING</code>.</p>

    </div>

- `params` (*dict*) -

    **[OPTIONAL]**

    A dictionary containing the configurations for the specified embedding function. The parameters available in this dictionary vary with the specified function type:

    - When `function_type` is set to `FunctionType.BM25`: No `params` config is available.

    - When `function_type` is set to `FunctionType.TEXTEMBEDDING`, possible `params` configs:

        - `provider` (*str*) -

            The embedding model provider. Possible values are as follows:

            - `openai` ([OpenAI](https://milvus.io/docs/openai.md))

            - `azure_openai` ([Microsoft Azure OpenAI](https://milvus.io/docs/azure-openai.md))

            - `dashscope` ([DashScope](https://milvus.io/docs/dashscope.md))

            - `bedrock` ([Amazon Bedrock](https://milvus.io/docs/bedrock.md))

            - `vertexai` ([Google Cloud Vertext AI](https://milvus.io/docs/vertex-ai.md))

            - `voyageai` ([Voyage AI](https://milvus.io/docs/voyage-ai.md))

            - `cohere` ([Cohere](https://milvus.io/docs/cohere.md))

            - `siliconflow` ([SiliconFlow](https://milvus.io/docs/siliconflow.md))

            - `TEI` ([Hugging Face Text Embedding Inference](https://milvus.io/docs/hugging-face-tei.md))

        - `model_name` (*str*) -

            The name of the embedding model to use. The value varies with the provider. For details, refer to their respective document page.

        - `credential` (*str*) -

            The label of a credential defined in the top-level `credential:` section of `milvus.yaml`. 

            - When provided, Milvus retrieves the matching key pair or API token and signs the request on the server side.

            - When omitted (`None`), Milvus falls back to the credential explicitly configured for the target model provider in `milvus.yaml`.

            - If the label is unknown or the referenced key is missing, the call fails.

        - `dim` (*str*) -

            The number of dimensions for the output embeddings. For OpenAI's third-generation models, you can shorten the full vector to reduce cost and latency without a significant loss of semantic information. For more information, refer to [OpenAI announcement blog post](https://openai.com/blog/new-embedding-models-and-api-updates).

            <div class="admonition note">

            <p><b>notes</b></p>

            <p>If you shorten the vector dimension, ensure the <code>dim</code> value specified in the schema's <code>add_field</code> method for the vector field matches the final output dimension of your embedding function.</p>

            </div>

    - When `function_type` is set to `FunctionType.RERANK`, possible `params` configs:

        -

    - `user` (*str*) -   

        A user-level identifier for tracking API usage.

    - `reranker` (*str*) -

        A unique identifier for this reranking function. Possible values areas follows:

    - `weights` (*List[float]*) -

    - `norm_score` (*boolean*) -

    - `k` (*int*) -

    - `function` (*str*) -

    - `origin` (*int*) -

    - `scale` (*int*) -

    - `offset` (*int*) -

    - `decay` (*float*) -

- `description` (*str*) -

    **[OPTIONAL]**

    A brief description of the function's purpose. This can be useful for documentation or clarity in larger projects and defaults to an empty string.

**RETURN TYPE:**

Instance of `Function` that encapsulates the specific processing behavior for converting raw data to vector embeddings.

**RETURNS:**

A `Function` object that can be registered with a Milvus collection, facilitating automatic embedding generation during data insertion.

**EXCEPTIONS:**

- `UnknownFunctionType`

    This exception will be raised when an unsupported or unrecognized function type is specified.

- `FunctionIncorrectInputOutputType`

    This exception will be raised when one or more field names in `input_field_names` or `output_field_names` are not strings.

- `FunctionDuplicateInputs`

    This exception will be raised when there are duplicate field names in `input_field_names`.

- `FunctionDuplicateOutputs`

    This exception will be raised when there are duplicate field names in `output_field_names`.

- `FunctionCommonInputOutput`

    This exception will be raised when there is an overlap between `input_field_names` and `output_field_names`, meaning that the same field name is present in both.

## Examples

```python
from pymilvus import Function, FunctionType

# use BM25
bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names=["sparse_vector"],
    function_type=FunctionType.BM25,
)

# use TEXTEMBEDDING
text_embedding_function = Function(
    name="openai_embedding",                        # Unique identifier for this embedding function
    function_type=FunctionType.TEXTEMBEDDING,       # Type of embedding function
    input_field_names=["document"],                 # Scalar field to embed
    output_field_names=["dense"],                   # Vector field to store embeddings
    params={                                        # Provider-specific configuration (highest priority)
        "provider": "openai",                       # Embedding model provider
        "model_name": "text-embedding-3-small",     # Embedding model
        # "credential": "apikey1",                    # Optional: Credential label specified in milvus.yaml
        # Optional parameters:
        # "dim": "1536",                            # Optionally shorten the output vector dimension
        # "user": "user123"                         # Optional: identifier for API tracking
    }
)
```
