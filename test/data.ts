import JWT from "jsonwebtoken";

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAkR+r0qH9Po/2VG0Eb8PxTiheNLW1owVjlYHxtLwN39FFxSKA
f7XmEqUOOwuYjzf2J6esEdQ01aEOKJ+G13CKVRNNBl2LrZGeF4XmbfmIxuZdkcHh
jjrtBz6sCMEIzLax0AzLZEUMrnOV7Qc2lDgJvNl8S9Pvxut1TvgYTE0uNvl52LiD
L6Kda1UZpVzAFh8vD7FJqJWNa115RqHtYL7TGolTFHyJOuPcKUV1h/RvxYA5enBp
7qqoq/F8FFQxHw0kEbTdG6wDsMDF+Qr5oOdvRm/hIJ15Jc6SpjdU5YEb5B7+cCJ9
uM1aYe6ZkTw1lCX1J/qX9a5/6qhBg07HZk38pQIDAQABAoIBACN1dpkvpV389PYp
8PSSDsrHCEWexHPBpFRqfLFpZYZzbrW9OWJ7Am050SFSMwODa+zChkOQ8xvjjz8T
w3GueM5SufY9MxzEwLkEqYnjd60JqoEruz3yXenwQT6eU9UZKpcoGSY1zORvL4nL
wmUy0AZJqZopfaO/8ljKO72g+hLKQVWgsFEb8SH2U22hPUO1m00tnkQ/UArOA21m
4XqaHTS09YRiqHfJ/u0dn142jbM2VZd35qK6gptsagGhUbXSuHOTUMDStjH9zbhv
UQtHTXq4rUJ5b40U3BvwA+4IUG6utrbU5DzkQ+/GfY1NpVZoH90h+wJz4mWL86pA
nERqnp0CgYEA18WjTHtUfIeHOXnsSW8KNNhPFSS9qk3+9sZPsm2nTC5I/GpyF1Xm
QzHDRPNkwPvs7FpuSMWXfE6jwFxGLj01wPH9swRfGJQZwXwMAwUki5yA/EVqCoC7
pk4Cbc3NPTBgCB6LfekzTF8xKd3bLgDTIPcYnFm/WCuccP9K7QxJEasCgYEArC4h
7JuVy1xjC1G/32Z/GVizqvcFPNkSYDwFEBi/cRJMOrKLB+CiffqeA/J8d790f1fo
MmqWW3qv+4nUwZ7190lp0GK8WPq6Xc3LMJFdO1YQFVOSbTa1ghDvP9oJbMtzzQgS
ZuH2endHSX67Cs3UIKMAIc+nZFicnxi4yR4Beu8CgYB+KDI4T4uwW9V2h5Ddxqyj
BS4H4Ll8T6oZQw3p9y7v3cgSvXIDrte4xemz8NMh+qol7yG4Lr9JkPkxSUJHWsaJ
D3QULSQkzMLaW9ryERmy/0hzN2quxWHx9H57EO9FLXmYhbNtZOH3b1jhb7PtC9Jl
3dNn5xl3RdhsQPff7WTzjQKBgGZ43j/PKQtq5JdsA+GVQrd3DxcFBNz94+3aSrkV
wXouBag5cn0xuAN6EGkQ+/rYuyC+1LaMsQeosOvnT/QcAw81ZgBbgvUB48DIJdG1
8eLKia/nmRHeqY/LPFioD0vsmfLAhxMsEGE6c/bNscvwS/tQh1eYGmuiQTR+phsr
/H2JAoGABj8npsxLg0lzgHEG8G7hr8Mx4igp5Qx8u94ldl1XNg8vtNgot8cuFD7a
RvV47bFIs3wQWiXolwnc7I12MschMqJB6SOrLysZ5tByHOx1Aq/uw5GxMCpc5b/D
nQ6Gva7mcRJRjFkIVXThjyRUaqk96lej/gGjuGWQObCTzj61T0g=
-----END RSA PRIVATE KEY-----`;

export const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkR+r0qH9Po/2VG0Eb8Px
TiheNLW1owVjlYHxtLwN39FFxSKAf7XmEqUOOwuYjzf2J6esEdQ01aEOKJ+G13CK
VRNNBl2LrZGeF4XmbfmIxuZdkcHhjjrtBz6sCMEIzLax0AzLZEUMrnOV7Qc2lDgJ
vNl8S9Pvxut1TvgYTE0uNvl52LiDL6Kda1UZpVzAFh8vD7FJqJWNa115RqHtYL7T
GolTFHyJOuPcKUV1h/RvxYA5enBp7qqoq/F8FFQxHw0kEbTdG6wDsMDF+Qr5oOdv
Rm/hIJ15Jc6SpjdU5YEb5B7+cCJ9uM1aYe6ZkTw1lCX1J/qX9a5/6qhBg07HZk38
pQIDAQAB
-----END PUBLIC KEY-----`;

// export const pKey = publicKey;

export const signedToken = JWT.sign(
  JSON.stringify({ foo: "bar", iss: "http://api.example" }),
  privateKey.toString(),
  { algorithm: "RS256", keyid: "test" },
);
