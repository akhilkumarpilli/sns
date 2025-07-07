/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sns.json`.
 */
export type Sns = {
  "address": "6wfx3ZD75ePHe5ioWuwqJNbJmyAioYtT19QFHHGHbZxB",
  "metadata": {
    "name": "sns",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "admin",
          "type": "pubkey"
        },
        {
          "name": "treasury",
          "type": "pubkey"
        },
        {
          "name": "pricePerChar",
          "type": "u64"
        }
      ]
    },
    {
      "name": "registerName",
      "discriminator": [
        101,
        120,
        221,
        151,
        68,
        123,
        191,
        103
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "nameRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "reverseRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  101,
                  114,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    },
    {
      "name": "renewName",
      "discriminator": [
        236,
        176,
        53,
        141,
        135,
        23,
        77,
        87
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "nameRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "name_record.name",
                "account": "nameRecord"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setReverseRecord",
      "discriminator": [
        149,
        161,
        63,
        240,
        122,
        202,
        219,
        231
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "reverse",
          "writable": true
        },
        {
          "name": "nameRecord",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateMetadata",
      "discriminator": [
        170,
        182,
        43,
        239,
        97,
        78,
        225,
        186
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "nameRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "name_record.name",
                "account": "nameRecord"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newMetadata",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdrawFees",
      "discriminator": [
        198,
        212,
        171,
        109,
        144,
        215,
        174,
        89
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "treasury",
          "writable": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "nameRecord",
      "discriminator": [
        254,
        22,
        17,
        161,
        229,
        49,
        238,
        105
      ]
    },
    {
      "name": "reverseRecord",
      "discriminator": [
        125,
        98,
        59,
        20,
        159,
        18,
        85,
        123
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nameTooLong",
      "msg": "Name is too long"
    },
    {
      "code": 6001,
      "name": "metadataTooLong",
      "msg": "Metadata is too long"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6003,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for registration"
    },
    {
      "code": 6004,
      "name": "noFeesAvailable",
      "msg": "No fees available"
    }
  ],
  "types": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "pricePerChar",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "nameRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "reverseRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          }
        ]
      }
    }
  ]
};
