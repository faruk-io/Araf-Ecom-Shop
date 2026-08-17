# EonsApi — ASP.NET Core Web API (migration step 2/4)

Covers: **Auth** (`auth.php`) and **Products** (`products.php`) — one-to-one behavioural
port, verified against the original PHP line by line.

## Run it

```bash
cd EonsApi
dotnet restore
dotnet run
```

Before running, edit `appsettings.json` → `ConnectionStrings:Default` to point at the
database you created with `schema.mssql.sql` (same DB name you used in SSMS).

API comes up on `https://localhost:5001` (or check the console output for the exact port).

## Test it

```bash
# public — should return the 35 seeded products
curl http://localhost:5001/api/products

# staff login — default seeded passcode is "eons" (change it after first login)
curl -c cookies.txt -X POST http://localhost:5001/api/auth \
  -H "Content-Type: application/json" -d "{\"passcode\":\"eons\"}"

# staff-only: create a product (cookie from previous step required)
curl -b cookies.txt -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Item\",\"cat\":\"Peripherals\",\"sub\":\"Monitors\",\"desc\":\"test\",\"price\":1000,\"old\":0,\"stock\":5}"
```

## What's intentionally not here yet (next steps)

- Orders / OrderItems (transaction + row-locked stock + status pipeline)
- Categories / Subcategories, Coupons, DeliveryZones, Banners, Settings CRUD endpoint
- `/api/bootstrap` combined endpoint (mirrors `bootstrap.php`)

Each of those follows the exact same pattern used here: entity in `Models/`, mapping in
`AppDbContext.OnModelCreating`, DTO in `Dtos/` with field names matching the current
frontend JSON exactly, controller replicating the PHP file's branches one for one.

## Note on this build

This project was hand-written directly from `api/*.php`, not scaffolded — the sandbox
this was generated in doesn't have NuGet access, so `dotnet restore`/`build` could not be
run here to compile-check it. Please run `dotnet build` on your machine as the first
step and report back any compile errors so they can be fixed immediately.
