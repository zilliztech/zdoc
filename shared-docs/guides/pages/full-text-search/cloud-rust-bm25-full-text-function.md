```rust
use milvus::v2::prelude::*;

let bm25_function = Function::new()
    .name("text_bm25_emb")
    .function_type(FunctionType::Bm25)
    .input_fields(["text"])
    .output_fields(["sparse"]);

let schema = schema.add_function(bm25_function);
```
