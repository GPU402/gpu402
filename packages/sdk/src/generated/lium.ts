// Generated from https://lium.io/api/openapi.json (Lium Backend API 1.0.0).
// Do not edit by hand: run `pnpm gen:types`.

export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health Check */
        get: operations["health_check__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The account's audit log: who did what, when, from where
         * @description One entry per mutating request made with the account's credentials (pod create / delete / restart, key create / revoke, logins, balance requests, settings, workspace membership), newest first. Each entry names the action, the session or API key (and the user who created it), the client IP, the client (`source`), the User-Agent and the `X-Request-Id` the request answered with. When Lium support lifts an account block (`admin-unblock-user`) that is listed too: `actor.auth` `cli`, `source` `admin`, and no user, IP, User-Agent, request id or summary. Outside a team workspace the account's own entries and the caller's entries as a member elsewhere; with `X-Lium-Workspace-Id` (or a team key) the team's entries: every member's for an owner or admin, the caller's own for a member. `ip` is filled on the caller's own entries only. Filters: `since` / `until` (ISO timestamps, UTC), `action` (a prefix: `pod.` is every pod action, `pod.delete` one; the names are in core/audit_actions.py), `source` (portal, cli, sdk, mcp, admin, api), `api_key_id`, `resource_id` (a pod, volume, key or workspace id). Pages: pass the page's `next_cursor` back as `cursor`. Needs the `read` scope on an API key.
         */
        get: operations["list_account_audit_account_audit_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/audit/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The account's audit log as CSV
         * @description The same entries as `GET /account/audit`, every page up to 10,000 rows, as a CSV attachment (`account-audit.csv`): created_at, action, source, actor (auth, user id, key id, key name), workspace_id, ip, user_agent, request_id, method, route, status_code, resource_type, resource_id. Filters: `since` / `until` (ISO timestamps, UTC), `action` (a prefix: `pod.` is every pod action, `pod.delete` one; the names are in core/audit_actions.py), `source` (portal, cli, sdk, mcp, admin, api), `api_key_id`, `resource_id` (a pod, volume, key or workspace id).
         */
        get: operations["export_account_audit_account_audit_export_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api-plans/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The caller's API plan */
        get: operations["my_api_plan_api_plans_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Turn auto-renewal of the paid API plan on or off */
        patch: operations["set_auto_renew_api_plans_me_patch"];
        trace?: never;
    };
    "/api-plans/pro/subscribe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Buy one month of the paid API plan from the balance
         * @description Charges the plan's monthly price from the balance; an active subscription is extended by a month. An `Idempotency-Key` header makes a retry safe: the same key returns the first answer instead of a second month.
         */
        post: operations["subscribe_pro_api_plans_pro_subscribe_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/github-login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login With Github */
        post: operations["login_with_github_auth_github_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/github-login-complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Github Login Complete
         * @description GitHub login callback
         */
        post: operations["github_login_complete_auth_github_login_complete_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/google-login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login With Google */
        post: operations["login_with_google_auth_google_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/google-login-complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Google Login Complete
         * @description Google login callback
         */
        post: operations["google_login_complete_auth_google_login_complete_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Fingerprint Login */
        post: operations["fingerprint_login_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Logout */
        post: operations["logout_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh Session
         * @description Swap the refresh cookie for a new one and a new access cookie (the web app calls it before the access cookie
         *     expires). A browser still holding the script-readable cookie from before gets its first HttpOnly pair here.
         *     The body never carries a token.
         */
        post: operations["refresh_session_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/resend-verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resend Verify Email
         * @description Endpoint to resent verify email: one answer for every address, the mail itself goes out after the response
         */
        post: operations["resend_verify_email_auth_resend_verify_email_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Fingerprint Signup
         * @description Create an account with no email or password and mint the fingerprint that logs into it.
         *
         *     Fully headless signup, meant for agents and scripts: no email, no password, no verification
         *     step, nothing that needs a human. Send an empty body: `username` is only a display name, it
         *     is not part of the login, and asking for a taken one fails with 409.
         *
         *     When the response carries a non-null `api_key`, it works immediately as the `X-API-Key`
         *     header. Key minting is best-effort, so signup still succeeds when `api_key` is null. Renting
         *     also requires a balance sufficient to cover the minimum rental window; signup credit is conditional.
         *
         *     Despite the name, the `fingerprint` is not WebAuthn, a passkey or biometrics — it is a random
         *     32-character string. It is returned exactly once, it is the login for the lium.io dashboard,
         *     and it is the only way back into an account that has no email, so the caller must store it.
         */
        post: operations["fingerprint_signup_auth_signup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Email
         * @description Endpoint to verify email using a token: a sign-up's address, or the pending address of an e-mail change.
         */
        post: operations["verify_email_auth_verify_email_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-configs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List backup configurations
         * @description Endpoint to list all backup configurations for the authenticated user.
         */
        get: operations["list_backup_configurations_backup_configs_get"];
        put?: never;
        /**
         * Create backup configuration
         * @description Endpoint to create a new backup configuration.
         */
        post: operations["create_backup_configuration_backup_configs_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-configs/{config_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update backup configuration
         * @description Endpoint to update an existing backup configuration.
         */
        put: operations["update_backup_configuration_backup_configs__config_id__put"];
        post?: never;
        /**
         * Delete backup configuration
         * @description Endpoint to delete a backup configuration.
         */
        delete: operations["delete_backup_configuration_backup_configs__config_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-configs/pod/{pod_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get backup configuration
         * @description Endpoint to get backup configuration for a specific pod.
         */
        get: operations["get_backup_configuration_backup_configs_pod__pod_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all backup logs
         * @description Endpoint to get all backup logs for a user with optional filtering by executor_id, search (searches in both name and description), backup_type (automatic/manual), and status.
         */
        get: operations["get_all_backup_logs_backup_logs__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/{backup_log_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get backup log
         * @description Endpoint to get a specific backup log by ID.
         */
        get: operations["get_backup_log_backup_logs__backup_log_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/{backup_log_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel backup */
        post: operations["cancel_backup_backup_logs__backup_log_id__cancel_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/{backup_log_id}/credentials": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Renew a running backup's scoped storage credentials
         * @description Renew scoped credentials for this running backup's repository. Requires the backup's Bearer token.
         */
        post: operations["refresh_backup_credentials_backup_logs__backup_log_id__credentials_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/{backup_log_id}/progress": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update backup progress
         * @description Endpoint to update backup progress and status. Requires JWT authentication via Authorization header.
         */
        put: operations["update_backup_progress_backup_logs__backup_log_id__progress_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/{log_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete backup log
         * @description Endpoint to delete/expire a backup log by marking it as DELETED and removing the backup file from S3.
         */
        delete: operations["delete_backup_log_backup_logs__log_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/bulk-delete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Bulk delete backup logs (async)
         * @description Endpoint to initiate async deletion of multiple backup logs (max 20). Returns task_id for polling status.
         */
        post: operations["bulk_delete_backup_logs_backup_logs_bulk_delete_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/bulk-delete/status/{task_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Poll bulk delete task status
         * @description Endpoint to poll the status of a bulk delete task.
         */
        get: operations["get_bulk_delete_status_backup_logs_bulk_delete_status__task_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backup-logs/pod/{pod_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get backup logs
         * @description Endpoint to get backup logs for a specific pod with optional pagination.
         */
        get: operations["get_backup_logs_for_pod_backup_logs_pod__pod_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/billing/billing-history/{miner_coldkey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the billing history for a provider */
        get: operations["billing_history_for_miner_billing_billing_history__miner_coldkey__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/billing/billing-info-for-users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the billing info for a user */
        get: operations["billing_info_for_users_billing_billing_info_for_users_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/billing/billing-per-day": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the billing info per day */
        get: operations["billing_per_day_billing_billing_per_day_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/billing/revenue-for-validators": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Revenue For Validators */
        get: operations["revenue_for_validators_billing_revenue_for_validators_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/billing/statement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Billing statement by pod
         * @description The ledger grouped by pod: every pod the account was charged for in the period, including pods that have since been removed, with one entry per ledger row (a UTC day can have more than one) and the seconds and $/h behind each amount. Each pod's `total` is the sum of its ledger rows, the figure the account balance was debited. Days are UTC billing days (YYYY-MM-DD); both bounds are inclusive and optional. Accepts a session or an `X-API-Key` holding the `read` scope.
         */
        get: operations["billing_statement_billing_statement_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/bookmark": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get bookmarked providers
         * @description Endpoint to get all bookmarked providers for the current user.
         */
        get: operations["get_bookmarked_providers_bookmark_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/bookmark/{miner_hotkey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Bookmark provider
         * @description Endpoint to bookmark a provider for easy re-booking.
         */
        post: operations["bookmark_provider_bookmark__miner_hotkey__post"];
        /**
         * Remove provider bookmark
         * @description Endpoint to remove a bookmark from a provider.
         */
        delete: operations["unbookmark_provider_bookmark__miner_hotkey__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/bookmark/executors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get nodes from bookmarked providers
         * @description Endpoint to get all available nodes from bookmarked providers.
         */
        get: operations["get_executors_from_bookmarked_providers_bookmark_executors_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/build-contexts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Build Context
         * @description Upload the build context of a custom-Dockerfile rent: a gzipped tar as the raw request body.
         *
         *     Rent with `dockerfile_content` and the returned `sha256` as `build_context_sha256`. The archive is kept for a
         *     limited time, so upload it right before the rent.
         */
        post: operations["upload_build_context_build_contexts_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cli-auth/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve Cli Auth Session
         * @description Approve CLI authentication session (requires user authentication).
         *     Creates a new expiring read, rent and manage API key for the CLI and associates it with the session.
         *     `session_id` in the body is the approval page's id from browser_url; the CLI's own session id is refused.
         */
        post: operations["approve_cli_auth_session_cli_auth_approve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cli-auth/init": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Init Cli Auth Session
         * @description Initialize CLI authentication session.
         *     Returns session_id and browser_url for user authentication.
         */
        post: operations["init_cli_auth_session_cli_auth_init_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cli-auth/poll/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Poll Cli Auth Session
         * @description Poll CLI authentication session status.
         *     Returns session status, and the API key on every poll of an approved session until it expires.
         *     A poll with a browser session (the approve page) never gets the key: it is for `lium init`.
         *     The approval page released before GET /status polls here with the approval id from browser_url; a signed-in
         *     poll by approval id gets the state as /status does, and an anonymous one stays a 404.
         */
        get: operations["poll_cli_auth_session_cli_auth_poll__session_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cli-auth/status/{approval_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cli Auth Session Status
         * @description What the approval page shows: the request's state, when it was made and from where. It never returns or uses
         *     up the key, so the page never takes the key meant for the CLI's GET /poll. A pending request has no owner yet;
         *     once approved it belongs to the approving user, and anyone else gets 404. The path takes the approval page's id
         *     from browser_url, never the CLI's session id.
         */
        get: operations["cli_auth_session_status_cli_auth_status__approval_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/clusters/{cluster_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a cluster
         * @description Whether every node of a cluster rental started. `status` is PROVISIONING while its nodes are being rented, then STARTING until every node has started once (RUNNING; a node's later reboot or failure does not change it). If a node fails or misses the 20-minute start deadline, every node is deleted (ROLLING_BACK, then ROLLED_BACK) and `member_failures` names the nodes that failed. DELETING and DELETED follow a cluster delete. Readable after the member pods are gone.
         */
        get: operations["get_cluster_clusters__cluster_id__get"];
        put?: never;
        post?: never;
        /**
         * Delete a cluster
         * @description Endpoint to delete a multi-node cluster rental by its id: every member pod is removed in one request and the response lists the outcome per pod. A cluster whose members are already being deleted answers 200 with each member in progress.
         */
        delete: operations["delete_cluster_clusters__cluster_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coinbase/create-charge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Charge */
        post: operations["create_charge_coinbase_create_charge_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coinbase/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Webhooks */
        post: operations["webhooks_coinbase_webhook_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crypto-wallets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Crypto Wallets
         * @description List all crypto wallets for the authenticated user.
         */
        get: operations["list_crypto_wallets_crypto_wallets_get"];
        put?: never;
        /**
         * Add Crypto Wallet
         * @description Add a new crypto wallet for the authenticated user.
         */
        post: operations["add_crypto_wallet_crypto_wallets_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crypto-wallets/{wallet_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete Crypto Wallet
         * @description Delete a crypto wallet.
         */
        delete: operations["delete_crypto_wallet_crypto_wallets__wallet_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crypto-wallets/{wallet_id}/set-default": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Set Default Crypto Wallet
         * @description Set a wallet as the default for payouts.
         */
        put: operations["set_default_crypto_wallet_crypto_wallets__wallet_id__set_default_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/data-partners/daily-aggregate.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Daily VWAP per GPU type and country (data partners only)
         * @description The same rentals as `/data-partners/trades.csv`, grouped by end day (the UTC day the rental completed, the axis the window selects on), GPU model and provider country: deal count, GPU-hours, volume-weighted average price, lowest and highest price per GPU-hour. `from`/`to` or `day` as on the trades route. Data partners only.
         */
        get: operations["daily_aggregate_csv_data_partners_daily_aggregate_csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/data-partners/dumps/{day}.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The nightly trades dump of one UTC day (data partners only)
         * @description The trades file the 01:00 UTC task wrote for `day` (YYYY-MM-DD): the same rows as `/data-partners/trades.csv?day=<day>` at the time it ran, kept in object storage so a missed poll never loses a day. 404 until the task has run for that day; 503 while the feed has no hash salt, like the live routes. Data partners only.
         */
        get: operations["trades_dump_data_partners_dumps__day__csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/data-partners/dumps/{day}.daily-aggregate.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The nightly daily-aggregate dump of one UTC day (data partners only)
         * @description The daily-aggregate file the 01:00 UTC task wrote for `day` (YYYY-MM-DD). 404 until the task has run for that day; 503 while the feed has no hash salt, like the live routes. Data partners only.
         */
        get: operations["daily_aggregate_dump_data_partners_dumps__day__daily_aggregate_csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/data-partners/hourly-gpu.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Hourly rentals, GPU-hours and mean price per GPU model (data partners only)
         * @description One row per closed UTC hour and GPU model with usage in the last `hours` hours: hour_utc, gpu_model, rentals (pods running in the hour), gpu_hours (GPU-time inside the hour) and mean_price_per_gpu_hour_usd (weighted by those GPU-hours). Aggregates only, never a renter, provider or node. Data partners only.
         */
        get: operations["hourly_gpu_csv_data_partners_hourly_gpu_csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/data-partners/trades.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Completed rentals as GX trade-data CSV (data partners only)
         * @description One row per rental that ended inside the window and before now, in the General Index trade-data CSV format: hashed renter and provider ids, price per GPU-hour, GPU count, start and end, GPU model, provider country. `from`/`to` is the live, incremental read; `day` is one closed UTC day, the same rows as that day's dump. Only an account flagged as a data partner may call it; other accounts get 403.
         */
        get: operations["trades_csv_data_partners_trades_csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/docker-credentials/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List */
        get: operations["list_docker_credentials__get"];
        put?: never;
        /** Create */
        post: operations["create_docker_credentials__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/docker-credentials/{docker_credential_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Find One */
        get: operations["find_one_docker_credentials__docker_credential_id__get"];
        /** Update */
        put: operations["update_docker_credentials__docker_credential_id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_docker_credentials__docker_credential_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all available nodes
         * @description Endpoint to retrieve all nodes that are not currently rented. `view=summary` returns only the fields a listing needs (id, machine_name, price, GPU/CPU/RAM/disk headline specs, location, tier, reliability, network, the nvlink verdict and the interconnect counts without the matrix) at about a tenth of the size; the response carries an `ETag` and answers `If-None-Match` with 304.
         */
        get: operations["get_available_executors_executors_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/{executor_uuid}/hardware-utilization": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get CPU and other hardware utilization for a node
         * @description Endpoint to retrieve hardware utilization metrics. Requires a JWT or API key; while any other account has a pod on the node, the caller is refused.
         */
        get: operations["get_hardware_utilization_executors__executor_uuid__hardware_utilization_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/{executor_uuid}/quote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Quote a job on a node
         * @description What renting this node for `hours` costs, line by line, at the rates billing charges: compute (price_per_gpu x gpu_count per hour, billed per second), volume and backup storage (per GB-hour stored). Egress is billed at what AWS charges and has no line amount. Nothing is reserved; the rent's own checks (GPU splitting, availability) still apply.
         */
        get: operations["get_job_quote_executors__executor_uuid__quote_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/{executor_uuid}/rent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rent node
         * @description Endpoint to rent a node with the provided details. Send an `Idempotency-Key` header (1-255 letters, digits, `-`, `_`, `.`, `:`; a UUID is fine) to make a retry safe: within 24 h the same key with the byte-identical body returns the first call's answer (the same `pod_id`) with `Idempotent-Replayed: true` and `Idempotency-Original-Request-Id`; a refused rent (4xx) is replayed the same way, and the same key with a corrected body runs again. The same key after a stored rent with a different body is refused (422 `idempotency_key_reused`); a malformed key is 422 `idempotency_key_invalid`; a repeat while the first call is still running gets 409 `idempotency_in_progress` with `Retry-After: 1`. Without the header every call rents.
         */
        post: operations["rent_executors__executor_uuid__rent_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/cluster/rent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rent a cluster
         * @description Rent several nodes of one InfiniBand fabric as a single all-or-nothing order. Every node is given a WireGuard overlay address so NCCL's bootstrap can find its peers; the tensors travel over InfiniBand. Whole nodes only. Omit `template_id` to run our cluster image. An `Idempotency-Key` header makes a retry safe exactly as on `POST /executors/{executor_uuid}/rent`.
         */
        post: operations["rent_cluster_executors_cluster_rent_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Count Executors */
        get: operations["count_executors_executors_count_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/default-docker-image": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get default docker image of node
         * @description Endpoint to retrieve default docker image of node.
         */
        get: operations["get_default_docker_image_executors_default_docker_image_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/deployment-estimate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Estimate deployment time
         * @description Estimate deployment time for a template on a specific node.
         */
        get: operations["get_deployment_estimate_executors_deployment_estimate_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/infiniband-clusters": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get nodes that can be combined into an InfiniBand cluster
         * @description Groups of nodes that sit on one InfiniBand fabric and can therefore run a single multi-node job. Renting is still per node; nothing here reserves the group.
         */
        get: operations["get_infiniband_clusters_executors_infiniband_clusters_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/rent-by-spec": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rent the cheapest node matching a spec
         * @description Rent one node without naming it: the server picks the cheapest rentable node ($/GPU·h) that satisfies every constraint in the request and rents it in the same call. Ties go to the faster ingress, then the higher reliability score (a node without a score ranks at the median score of the matching nodes), then the node id, so the same catalogue always yields the same pick. If the pick is taken between selection and rent the next candidate is tried (up to 3 in all); `attempts` says how many it took. With `dry_run=true` nothing is rented: the response carries the pick, its price and the template that would be used, so a client can show them before asking to confirm. When no node satisfies the spec the response is 409 `no_executor_matches_spec` naming the first constraint that left no candidate and the best value the remaining nodes offered for it. Everything else (authentication, balance, template, SSH keys, ports) behaves exactly as `POST /executors/{executor_uuid}/rent`, the `Idempotency-Key` header included: a retry with the same key and body returns the first call's pod instead of renting another node.
         */
        post: operations["rent_by_spec_executors_rent_by_spec_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get stats of nodes
         * @description Endpoint to retrieve stats of nodes.
         */
        get: operations["get_stats_of_executors_executors_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/total-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Total Count Of Active Executors */
        get: operations["get_total_count_of_active_executors_executors_total_count_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/executors/ws": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Current snapshot of the rentable executors (WebSocket address)
         * @description Returns the same `snapshot` frame a WebSocket client receives first, for a caller that wants the set once and does not want to hold a connection.
         *
         *     The same address serves a WebSocket at `wss://lium.io/api/executors/ws`. Connect to it to stay current: the socket opens with this snapshot and then sends `upsert`, `delete` and `heartbeat` frames. OpenAPI cannot describe a WebSocket, which is why it is named here.
         *
         *     No authentication. `503` means the publisher has not completed its first read yet; retry.
         */
        get: operations["executors_snapshot_executors_ws_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/feedbacks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get User Feedbacks
         * @description Get all feedback submissions by the authenticated user
         */
        get: operations["get_user_feedbacks_feedbacks_get"];
        put?: never;
        /**
         * Create Feedback
         * @description Submit new feedback (bug report, feature request, or general feedback)
         */
        post: operations["create_feedback_feedbacks_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/feedbacks/{feedback_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Feedback By Id
         * @description Get a specific feedback submission by ID
         */
        get: operations["get_feedback_by_id_feedbacks__feedback_id__get"];
        /**
         * Update Feedback
         * @description Update a feedback submission
         */
        put: operations["update_feedback_feedbacks__feedback_id__put"];
        post?: never;
        /**
         * Delete Feedback
         * @description Delete a feedback submission
         */
        delete: operations["delete_feedback_feedbacks__feedback_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Api Keys */
        get: operations["list_api_keys_keys_get"];
        put?: never;
        /**
         * Create Api Key
         * @description `key` is the whole key for every kind: the one time a billing key is shown.
         */
        post: operations["create_api_key_keys_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/keys/{api_key_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Api Key */
        get: operations["get_api_key_keys__api_key_id__get"];
        /** Update Api Key */
        put: operations["update_api_key_keys__api_key_id__put"];
        post?: never;
        /** Delete Api Key */
        delete: operations["delete_api_key_keys__api_key_id__delete"];
        options?: never;
        head?: never;
        /**
         * Set or clear the key's budgets or end-customer tag
         * @description `{"daily_budget_usd": 25}` sets a budget, `{"daily_budget_usd": null}` clears it; a field the body does not name is left as it is. Signed-in session only, like every key route; a key cannot lift its own budget. Resellers: `{"customer_ref": "<tag>"}` sets the tag every rental this key opens is recorded under; `{"customer_ref": null}` clears it. Rentals already recorded keep the tag they were opened under. 1-64 characters, letters, digits and `. _ : -`; anything else is 422.
         */
        patch: operations["patch_api_key_keys__api_key_id__patch"];
        trace?: never;
    };
    "/keys/{api_key_id}/refusals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * What the key's budgets refused
         * @description The key's `api_key_budget_refused` ledger, newest first (50 at most): when, which route, which budget window, the amount asked, the budget and the spend at the time. A signed-in session, or an API key asking about itself, whatever its scopes (an agent, a `billing` key too, may see why it was refused); 404 for a key the caller cannot see.
         */
        get: operations["list_api_key_refusals_keys__api_key_id__refusals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/keys/scopes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * What each API-key scope and pod-visibility setting reaches
         * @description One table for the dashboard's scope picker, `lium keys` and the SDK: scope, one-sentence description, what a key holding it can do, the route families it opens, and whether a key created without naming scopes gets it; the two pod-visibility values; and the money routes only `billing` reaches. Static text, no account data, so no credential is needed.
         */
        get: operations["list_api_key_scopes_keys_scopes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/locations/country_codes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Find Templates */
        get: operations["find_templates_locations_country_codes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machine-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List machine requests
         * @description Without credentials: an aggregate of the open machine requests (how many per GPU class and per hourly budget band), with nothing that names a request or a requester. With a JWT or API key: the caller's own requests, one row each. Providers read the full feed in the provider portal.
         */
        get: operations["find_machine_requests_get"];
        put?: never;
        /**
         * Create a machine request
         * @description Endpoint to create a machine request. Providers may receive an e-mail about it. The response's `provider_notified_count` is how many providers were selected for notification (from those subscribed to the GPU type plus the one named, if any); 0 means no provider was selected for notification.
         */
        post: operations["create_machine_requests_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machine-requests/{request_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get one of the caller's machine requests
         * @description One of the caller's own machine requests. Someone else's request is a 404.
         */
        get: operations["get_request_machine_requests__request_id__get"];
        /**
         * Update a request
         * @description Endpoint to update a request.
         */
        put: operations["update_machine_requests__request_id__put"];
        post?: never;
        /**
         * Close a request
         * @description Endpoint to close a request.
         */
        delete: operations["close_request_machine_requests__request_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machine-requests/{request_id}/achieve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Achieve a request
         * @description Endpoint to achieve a request.
         */
        post: operations["achieve_machine_requests__request_id__achieve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machine-requests/{request_id}/executors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get nodes assigned to one of the caller's machine requests
         * @description Endpoint to get all nodes a provider has assigned to one of the caller's machine requests.
         */
        get: operations["get_executors_for_request_machine_requests__request_id__executors_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all available machines */
        get: operations["list_machines_machines_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machines/capacity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Open earning capacity by GPU type
         * @description Per-bucket capacity from validator-precomputed estimates in Redis.
         *
         *     Returns one row per base_model with at least one priced bucket, for bucket=1 (single GPU) and bucket=8
         *     (full rig), each with what one more idle node of that size would be paid now; the row's unpriced buckets
         *     are in `ineligible_buckets` with the validator's reason. Source: GPU_ESTIMATES_KEY populated by the
         *     validator's precompute_all_estimates(). Empty list when validator has not pushed yet.
         */
        get: operations["list_capacity_machines_capacity_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machines/capacity/ineligible": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * GPU types outside the idle-pay program
         * @description The base models `/capacity` has no row for, from the same validator estimates.
         */
        get: operations["list_capacity_ineligible_machines_capacity_ineligible_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machines/estimate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get GPU reward estimate */
        get: operations["estimate_machines_estimate_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/machines/spot-idle-rates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Spot idle pay by GPU type
         * @description Spot idle pay per GPU-hour, subject to change.
         */
        get: operations["list_spot_idle_rates_machines_spot_idle_rates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nodes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List rentable nodes
         * @description The current rentable node catalogue used by Lium's own browse pages. The response is served from the availability feed's in-memory snapshot instead of running the availability query per request.
         */
        get: operations["list_nodes_nodes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/catalog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Notification Catalog */
        get: operations["get_notification_catalog_notifications_catalog_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/partners/me/rentals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Your rentals, GPU-hours, USD billed and fault closes, grouped
         * @description Aggregates of the account's rentals (every key and workspace of the account, one balance) for a window of whole UTC days: `rentals` and `gpu_hours` and `fault_closes` from the rental records (a rental sits in the day it was opened), `usd_billed` from the billing ledger (the rows whose billing day is in the window, the same rows the statement shows). Grouped by day, GPU model or `customer_ref`. Any account may call it with a `read` key or a session. Cached for five minutes (`private`).
         */
        get: operations["my_rentals_partners_me_rentals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/payments/topup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Top up the balance from a saved card, without a browser
         * @description Charges `amount_usd` to the saved default card (or `payment_method_id`) off-session and records the pending top-up; the balance is credited by the Stripe webhook, as after a Checkout. Risk checks decide whether the charge goes off-session or steps up to a 3-D Secure challenge; a step-up, or a bank that asks for authentication, answers 402 `CARD_AUTHENTICATION_REQUIRED` with `next_action_url`: the cardholder confirms there and the webhook credits the balance, with no further call (a repeat with the same key answers the same URL). Through a key with a spending budget, a previously verified card normally charges without another confirmation. Lium asks again if it cannot confirm the earlier check, and the bank can always require confirmation. Other callers also step up past the 24-hour velocity. A step-up is authorized only and captured only when its 3-D Secure result shifted the fraud liability to the bank; otherwise the authorization is canceled and the call refused with 402 `CARD_AUTHENTICATION_UNAVAILABLE`, charged nothing. A wallet (Link, Apple Pay, Google Pay) is refused with 402 `WALLET_NOT_SUPPORTED` before anything is written or sent to the bank. A 402 without `next_action_url`, or `CARD_DECLINED`, is final: retry with a new `idempotency_key` (the same key always replays it and cannot charge twice). 202 `processing`: the row is not credited yet (first call or a repeat), or Stripe's answer to the charge call was lost. 200 `succeeded` only once the row is COMPLETED (credited by the webhook, or by this call when it captured a confirmed step-up). First and repeat read that same row, so a succeeded PaymentIntent stays `processing` until the credit. Do not repeat the call without the returned `idempotency_key`; with it the repeat is the same transaction. The same key with a different amount is a new charge. Session, or an API key with the `billing` scope.
         */
        post: operations["top_up_by_card_payments_topup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/payouts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get User Payouts
         * @description Get payout history for the authenticated user.
         */
        get: operations["get_user_payouts_payouts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/payouts/{payout_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Payout Details
         * @description Get specific payout details.
         */
        get: operations["get_payout_details_payouts__payout_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all pods
         * @description Endpoint to get all available pods.
         */
        get: operations["get_pods_pods_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get pod by ID
         * @description Endpoint to get a specific pod by its ID.
         */
        get: operations["get_pod_by_id_pods__id__get"];
        /**
         * Edit pod
         * @description Endpoint to edit an existing pod with the provided details.
         */
        put: operations["edit_pod_pods__id__put"];
        post?: never;
        /**
         * Delete pod
         * @description Endpoint to delete an existing pod. An optional JSON body (`feedback_text`, `rating` 1-5, `reason`) records feedback on the pod's node first, as `POST /pods/{id}/feedback` does.
         */
        delete: operations["delete_pod_pods__id__delete"];
        options?: never;
        head?: never;
        /**
         * Update pod
         * @description Endpoint to update an existing pod with the provided details.
         */
        patch: operations["update_pod_pods__id__patch"];
        trace?: never;
    };
    "/pods/{id}/bare-metal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Make the rental bare-metal
         * @description Turns a running rental of a whole node into a bare-metal rental: the node's provider is asked to give the pod's SSH key root on the host. Only on a node whose provider offers bare-metal rentals.
         */
        post: operations["start_bare_metal_pods__id__bare_metal_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/discord-channel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create pod Discord support channel
         * @description Endpoint to create or return a Discord support channel for a specific pod.
         */
        post: operations["create_pod_discord_channel_pods__id__discord_channel_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get pod events
         * @description Every event recorded for the pod, oldest first: creation, reboots, failures with their error, and pod-lifecycle entries that say why the pod left RUNNING (user_initiated, scheduled_termination, insufficient_balance, executor_offline, executor_reclaimed, broken_by_provider, dispute_block, reboot_failed, unknown). Answers for pods that have already been deleted; an id that never belonged to the caller returns []. An API key without the `read` scope reads only the pods it created, while they exist.
         */
        get: operations["get_pod_events_pods__id__events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/install-jupyter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Install Jupyter for a pod
         * @description Install Jupyter for a specific pod
         */
        post: operations["install_jupyter_for_pod_pods__id__install_jupyter_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Toggle like/unlike a pod
         * @description Endpoint to toggle like/unlike a pod.
         */
        post: operations["toggle_like_pod_pods__id__like_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/multiple-ssh-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Add SSH keys to pod
         * @description Endpoint to add multiple SSH keys to an existing pod.
         */
        post: operations["add_multiple_ssh_keys_to_pod_pods__id__multiple_ssh_keys_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/no-interrupt-until": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Set the pod's no-planned-interruption window
         * @description Until this UTC time the provider cannot start a planned maintenance or removal notice on the pod's node. null clears it. 409 while the feature is off.
         */
        put: operations["set_no_interrupt_until_pods__id__no_interrupt_until_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/price-change-alternatives": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Alternatives to a pending price raise
         * @description While the pod has a pending provider price raise (`pending_price`), up to three nodes from the public listing with the same GPU type that fit the pod's GPU count at or below what the pod pays now, cheapest first. A pod rented Secure is offered Secure nodes only; the pod's own node is never listed. `alternatives` is empty when there is no pending raise or no such node. Read-only: renting one is an ordinary new rental.
         */
        get: operations["get_price_change_alternatives_pods__id__price_change_alternatives_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/reboot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reboot pod
         * @description Endpoint to reboot a pod.
         */
        post: operations["reboot_pod_pods__id__reboot_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/record": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pod run record
         * @description One record of a run, to repeat or cite it: GPU model and count, the image reference the container was started from (with its digest when the template pins one), the template, the node's NVIDIA driver, CUDA version and GPU interconnect as the listing showed them when the container came up (`launch_snapshot`), start and end, why it ended, and the total charged (the statement's total). Answers for a removed pod. `launch_snapshot` is null for a run that started before it was recorded. 404 under the same rule as GET /pods/{id}/statement.
         */
        get: operations["get_pod_run_record_pods__id__record_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/reset-gpu": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reset pod GPUs
         * @description Start a reset of a running pod's GPUs (DAH-4658): the pod's container is stopped, the GPUs are reset and the container is started again. Every process in the pod stops; files are kept. `gpu_indices` are the pod's own indices (as `nvidia-smi` shows them inside the pod); omit them to reset every GPU of the pod. The answer is `status: running` with a `request_id`: poll `GET /pods/{id}/reset-gpu/{request_id}` for the result. Errors name their reason in `error.code`.
         */
        post: operations["reset_pod_gpu_pods__id__reset_gpu_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/reset-gpu/{request_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a pod GPU reset
         * @description The state of a GPU reset that `POST /pods/{id}/reset-gpu` started: `running`, then `done` (with each GPU's outcome), `failed` (with `error.code`) or `timeout` when the validator did not answer in 5 minutes. Results are kept for 1 hour.
         */
        get: operations["get_pod_gpu_reset_pods__id__reset_gpu__request_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/schedule-removal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Schedule removal of a pod
         * @description Endpoint to schedule removal of a pod.
         */
        post: operations["schedule_removal_pods__id__schedule_removal_post"];
        /**
         * Delete scheduled removal of a pod
         * @description Endpoint to delete scheduled removal of a pod.
         */
        delete: operations["delete_scheduled_removal_pods__id__schedule_removal_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/statement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pod billing statement
         * @description Everything the account was charged for this pod, read from the billing ledger rather than the pod row, so it answers for a removed pod as well as a running one. `total` is the sum of the pod's ledger rows; `days` lists those rows oldest first (a UTC day can have more than one, for example when billing stops and resumes) with the seconds and $/h behind each amount; for a removed pod the last row carries the final settlement made on removal and `removed_at`/`close_reason` say when and why it ended. A running pod lags the clock by at most one 5-minute accrual (`billed_until`). 404 when the account has neither the pod nor a charge for it, and for an API key without the `read` scope on any pod it did not create (or that is gone).
         */
        get: operations["get_pod_statement_pods__id__statement_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{id}/switch-template": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Switch template
         * @description Endpoint to switch the template of a pod.
         */
        put: operations["switch_template_pod_pods__id__switch_template_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{pod_id}/backup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trigger backup pod
         * @description Endpoint to backup a pod.
         */
        post: operations["trigger_backup_pod_pods__pod_id__backup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{pod_id}/feedback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create feedback for a pod
         * @description Create feedback for a specific pod
         */
        post: operations["create_pod_feedback_pods__pod_id__feedback_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{pod_id}/gpu-utilization": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get GPU utilization for a specific pod
         * @description Endpoint to retrieve GPU utilization metrics for one of the caller's pods.
         */
        get: operations["get_pod_gpu_utilization_pods__pod_id__gpu_utilization_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{pod_id}/logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stream container logs
         * @description Stream container logs from the node for a specific pod using Server-Sent Events.
         */
        get: operations["stream_container_logs_pods__pod_id__logs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{pod_uuid}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start restore process
         * @description Endpoint to start restore process for a specific pod with backup ID.
         */
        post: operations["trigger_restore_pod_pods__pod_uuid__restore_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/pods/{pod_uuid}/restore-logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get restore logs
         * @description Endpoint to get restore logs for a specific pod with optional pagination.
         */
        get: operations["get_restore_logs_for_pod_pods__pod_uuid__restore_logs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/provider-referrals/attribute": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Attribute Provider Referral
         * @description Link the calling provider to the owner of a PROV- code. Once per provider; not to itself.
         */
        post: operations["attribute_provider_referral_provider_referrals_attribute_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/provider-referrals/first-login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Record Provider First Login
         * @description The portal's login signal: sent when a login or signup completes. The first one stamps the provider's
         *     ``first_login_at``; the late-entry window for entering a referral code counts from it (or from the row's
         *     creation for a provider the portal never signalled). Idempotent.
         */
        post: operations["record_provider_first_login_provider_referrals_first_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/provider-referrals/payout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request Provider Referral Payout
         * @description Withdraw the whole accrued balance, in USDT on Ethereum or as Lium credits.
         */
        post: operations["request_provider_referral_payout_provider_referrals_payout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/provider-referrals/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Provider Referral Summary
         * @description The calling provider's code, balance and referred providers with their GPU decisions.
         */
        get: operations["provider_referral_summary_provider_referrals_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/provider-stats/{miner_hotkey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get comprehensive statistics for a provider
         * @description Endpoint to retrieve detailed statistics for a provider including network speed, location, feedback rates, rental failures, rental successes, uptime, and more. No API key or session is needed: the marketplace provider page shows these statistics to every visitor (DAH-3462).
         */
        get: operations["get_provider_statistics_provider_stats__miner_hotkey__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/provider-stats/{miner_hotkey}/executors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get nodes for a provider
         * @description Endpoint to retrieve the live nodes of a provider including rental information; an empty list when it has none. No API key or session is needed: the marketplace provider page lists these nodes to every visitor; each node carries the fields of the public /executors listing plus what that page shows (DAH-3462).
         */
        get: operations["get_provider_executors_provider_stats__miner_hotkey__executors_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/provider-stats/coldkey/{miner_coldkey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Find the provider pages of a coldkey
         * @description The provider page and the routes above are keyed by hotkey. This endpoint lists the hotkeys whose nodes report the given coldkey, so a visitor who has the coldkey reaches the right page. No API key or session is needed, like the provider page itself.
         */
        get: operations["get_provider_hotkeys_for_coldkey_provider_stats_coldkey__miner_coldkey__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/launch-stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Launch success rate and time to SSH per GPU type
         * @description For every GPU type and GPU count with at least `min_launches` launches on at least `min_providers` providers in the last `window_days` days: the share of launches that reached RUNNING, and the median and 90th percentile seconds from the rent request to RUNNING. Recomputed from production data every 15 minutes. No authentication. Fields are only ever added; a breaking change ships as /public/v2.
         */
        get: operations["launch_stats_public_v1_launch_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/nodes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Public GPU inventory and pricing feed
         * @description Every node currently rentable on Lium, with normalized GPU names, per-GPU and per-node hourly prices, location and a deep link to rent it. No authentication required. With include_rented=true it also lists the nodes that are on the market but rented now, with available_now false and available_gpu_count 0, so every ask is visible. Fields are only ever added to this response; a breaking change ships as /public/v2, and a retired version stays served for six months after the deprecation notice.
         */
        get: operations["list_nodes_public_v1_nodes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Open machine requests per GPU class
         * @description What renters are asking for right now, aggregated per GPU class: how many open requests, how many GPUs they add up to and when the oldest was filed. No requester data, no per-request rows. No authentication. Fields are only ever added; a breaking change ships as /public/v2. 404 while the feature is off.
         */
        get: operations["list_requested_classes_public_v1_requests_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Public network stats
         * @description The figures on lium.io/stats: GPUs listed and rented per model, the cheapest ask and the 30-day median paid price per model, 30-day utilisation, GMV billed, GPU-hours and rentals per day, countries and provider reliability. Aggregates only. No authentication. The feed refreshes every 5 minutes; the 30-day figures (paid prices, utilisation) update daily. Fields are only ever added; a breaking change ships as /public/v2.
         */
        get: operations["get_public_stats_public_v1_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Readiness probe
         * @description 200 when this instance can serve traffic: Postgres answers and the executor feed has loaded (Redis is reported in `checks`, never a reason to fail, as it is shared by every replica). 503 names the failing dependency; also 503 once the process is shutting down.
         */
        get: operations["ready_ready_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/referrals/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Referral History
         * @description Get detailed referral history for the authenticated user.
         */
        get: operations["get_referral_history_referrals_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/referrals/my-code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get My Referral Code
         * @description Get or create referral code for the authenticated user.
         */
        get: operations["get_my_referral_code_referrals_my_code_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/referrals/pending-payouts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pending Payouts
         * @description Get all pending referral payouts for the authenticated user.
         */
        get: operations["get_pending_payouts_referrals_pending_payouts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/referrals/program-info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Referral Program Info
         * @description Get referral program reward information with tiered commission rates.
         */
        get: operations["get_referral_program_info_referrals_program_info_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/referrals/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Referral Stats
         * @description Get referral statistics for the authenticated user.
         */
        get: operations["get_referral_stats_referrals_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/referrals/validate/{code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Validate Referral Code
         * @description Validate a referral code (public endpoint for registration flow).
         */
        post: operations["validate_referral_code_referrals_validate__code__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/referrals/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Withdraw Referral Rewards
         * @description Withdraw accumulated referral rewards from pending_referral_balance.
         */
        post: operations["withdraw_referral_rewards_referrals_withdraw_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/restore-logs/{restore_log_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel restore */
        post: operations["cancel_restore_restore_logs__restore_log_id__cancel_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/restore-logs/{restore_log_id}/progress": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update restore progress
         * @description Endpoint to update restore progress and status. Requires JWT authentication via Authorization header.
         */
        put: operations["update_restore_progress_restore_logs__restore_log_id__progress_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ssh-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Find My Ssh Keys */
        get: operations["find_my_ssh_keys_ssh_keys_get"];
        put?: never;
        /** Register Ssh Key */
        post: operations["register_ssh_key_ssh_keys_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ssh-keys/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Find One My Ssh Key */
        get: operations["find_one_my_ssh_key_ssh_keys__id__get"];
        /** Update */
        put: operations["update_ssh_keys__id__put"];
        post?: never;
        /** Delete */
        delete: operations["delete_ssh_keys__id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stablecoin/provider-payouts/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Provider Payout Webhook
         * @description Status callbacks for provider stablecoin payouts (DAH-3084): PENDING · CONFIRMED · FAILED, same signature scheme.
         *
         *     A plain `def`: the handler runs two queries and a commit synchronously, so FastAPI keeps it off the event loop.
         */
        post: operations["provider_payout_webhook_stablecoin_provider_payouts_webhook_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stablecoin/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Crypto Transfer Webhook
         * @description Handle webhook callbacks from the crypto transfer microservice.
         *
         *     The microservice sends webhooks with status updates:
         *     - PENDING: Transfer initiated
         *     - CONFIRMED: Transfer confirmed on blockchain
         *     - FAILED: Transfer failed
         */
        post: operations["crypto_transfer_webhook_stablecoin_webhook_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/connect/account": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Connect Account
         * @description Create a Stripe Connect account for receiving payouts
         */
        post: operations["create_connect_account_stripe_connect_account_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/connect/onboarding-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Onboarding Link
         * @description Generate an onboarding link for Stripe Connect account setup
         */
        post: operations["create_onboarding_link_stripe_connect_onboarding_link_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/connect/supported-countries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Supported Countries
         * @description Get list of all countries supported by Stripe Connect
         */
        get: operations["get_supported_countries_stripe_connect_supported_countries_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/create-checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Checkout Session */
        post: operations["create_checkout_session_stripe_create_checkout_session_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/invoices/{invoice_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Invoice */
        get: operations["get_invoice_stripe_invoices__invoice_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/payments/payment-methods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Payment Methods */
        get: operations["list_payment_methods_stripe_payments_payment_methods_get"];
        put?: never;
        /** Add Payment Method */
        post: operations["add_payment_method_stripe_payments_payment_methods_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/payments/payment-methods/{payment_method_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Payment Method */
        delete: operations["delete_payment_method_stripe_payments_payment_methods__payment_method_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/payments/payment-methods/{payment_method_id}/three-d-secure": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Payment Method Three D Secure
         * @description Return whether this card has successfully completed 3-D Secure.
         */
        get: operations["payment_method_three_d_secure_stripe_payments_payment_methods__payment_method_id__three_d_secure_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/transactions/{transaction_id}/invoice": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Invoice Card Topup */
        post: operations["invoice_card_topup_stripe_transactions__transaction_id__invoice_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/stripe/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Stripe Webhook */
        post: operations["stripe_webhook_stripe_webhook_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/create-transfer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Transfer */
        post: operations["create_transfer_tao_create_transfer_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/balance/alpha/subnets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Alpha Subnets */
        get: operations["alpha_subnets_tao_pay_balance_alpha_subnets_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/balance/convert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Convert */
        get: operations["convert_tao_pay_balance_convert_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/balance/convert/alpha": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Convert Alpha */
        get: operations["convert_alpha_tao_pay_balance_convert_alpha_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/token/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Generate Token */
        get: operations["generate_token_tao_pay_token_generate_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/token/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Coldkey Signature
         * @description Bind a coldkey to the CALLER, proven by its signature over an access key from GET /token/generate.
         */
        post: operations["verify_coldkey_signature_tao_pay_token_verify_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/transfer/potential": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Potential Transfer
         * @description The dashboard's TAO Pay flow (TaoPayConfirm) calls this before the transfer and stops when it fails.
         */
        post: operations["potential_transfer_tao_pay_transfer_potential_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/wallet/{wallet_id}/{customer_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete Wallet
         * @description Unbind one of the caller's coldkeys. The pay API checks the wallet row belongs to the customer.
         */
        delete: operations["delete_wallet_tao_pay_wallet__wallet_id___customer_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/wallet/available-wallets/{customer_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Available Wallets */
        get: operations["available_wallets_tao_pay_wallet_available_wallets__customer_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/wallet/company/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Company Wallet
         * @description Lium's deposit address. `app_id` is accepted for the old callers and ignored: always this deployment's.
         */
        get: operations["company_wallet_tao_pay_wallet_company__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/pay/wallet/pending-transfers/{customer_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pending Transfers */
        get: operations["pending_transfers_tao_pay_wallet_pending_transfers__customer_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tao/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Webhook */
        post: operations["webhook_tao_webhook_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Find Templates
         * @description Find all templates for a user. Support API Key authentication.
         *
         *     Optional query parameters:
         *     - gpu_model: GPU model name (e.g., "NVIDIA H100 80GB HBM3")
         *     - driver_version: Driver version (e.g., "535.86.10")
         *
         *     If both gpu_model and driver_version are provided, each template will include
         *     compatibility information.
         */
        get: operations["find_templates_templates_get"];
        put?: never;
        /** Create Template */
        post: operations["create_template_templates_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/templates/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Find One Template */
        get: operations["find_one_template_templates__id__get"];
        /** Update Template */
        put: operations["update_template_templates__id__put"];
        post?: never;
        /** Delete Template */
        delete: operations["delete_template_templates__id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/templates/check": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Check Template
         * @description What would stop a pod of this template from starting, before it is saved: the form shows each issue under its
         *     field. Empty when nothing definite was found.
         */
        post: operations["check_template_templates_check_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tmc-pay/create-invoice": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Invoice */
        post: operations["create_invoice_tmc_pay_create_invoice_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tmc-pay/currencies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Currencies */
        get: operations["get_currencies_tmc_pay_currencies_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tmc-pay/invoices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Invoices
         * @description DAH-3309: the caller's crypto invoices of the last 7 days that are open, expired or credited short.
         *     Feeds the Billing page's pending-deposits card. Empty while TMC_PAY_INVOICE_STATUS_ENABLED is off.
         */
        get: operations["list_invoices_tmc_pay_invoices_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tmc-pay/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Tmc Pay Webhook */
        post: operations["tmc_pay_webhook_tmc_pay_webhook_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the user's transactions
         * @description Every payment, credit and refund row of the authenticated user, with `is_deposit` and `is_first_deposit` computed per row.
         */
        get: operations["get_transactions_transactions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Signup */
        post: operations["signup_users_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/get-ip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Client Ip Endpoint */
        get: operations["get_client_ip_endpoint_users_get_ip_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login */
        post: operations["login_users_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Me */
        get: operations["me_users_me_get"];
        /** Update User */
        put: operations["update_user_users_me_put"];
        post?: never;
        /** Delete User */
        delete: operations["delete_user_users_me_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/auto-top-up": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Auto Top Up
         * @description Get auto top up configuration for the user.
         */
        get: operations["get_auto_top_up_users_me_auto_top_up_get"];
        /**
         * Update Auto Top Up
         * @description Update auto top up configuration for the user. Session, or an API key with the `billing` scope (the scope
         *     gate, core/api_key_scopes.py MONEY_ROUTES; team keys are refused there too) and no budget: the tick's auto-pay
         *     writes `api_key_id = NULL`, so a budgeted key's charge would never count against it.
         */
        put: operations["update_auto_top_up_users_me_auto_top_up_put"];
        post?: never;
        /**
         * Turn Off Auto Top Up
         * @description Turn auto top up off (threshold 0, the setting kept); a card saved later never turns it back on. Session, or
         *     an API key with the `billing` scope; turning it off charges nothing, so a budget does not matter here.
         */
        delete: operations["turn_off_auto_top_up_users_me_auto_top_up_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/auto-top-up/first-charge-notice": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Dismiss Auto Top Up First Charge Notice
         * @description Hide the one-time notice of the first charge of an Auto Top Up the first card turned on.
         */
        delete: operations["dismiss_auto_top_up_first_charge_notice_users_me_auto_top_up_first_charge_notice_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/billing-profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Billing Profile
         * @description The company name, billing address and tax id printed on the account's Stripe invoices.
         */
        get: operations["get_billing_profile_users_me_billing_profile_get"];
        /**
         * Update Billing Profile
         * @description Save the invoice details and push them to the Stripe customer (see StripeService.save_billing_profile).
         */
        put: operations["update_billing_profile_users_me_billing_profile_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/discord": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Disconnect Discord */
        delete: operations["disconnect_discord_users_me_discord_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/discord/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Connect Discord Callback */
        get: operations["connect_discord_callback_users_me_discord_callback_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/discord/oauth-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Discord Oauth Url */
        get: operations["get_discord_oauth_url_users_me_discord_oauth_url_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the account's event log
         * @description Every event recorded for the account, newest first: pod rent requests, creations, reboots, deletions and their reasons, API/SSH key, template and workspace changes. Each entry names the actor: the browser session or the API key (id and name) that made the request; platform-initiated events carry no actor. Filter by `since`, `pod_id` (also answers for deleted pods) and `api_key_id`. An API key needs the `read` scope.
         */
        get: operations["get_events_users_me_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/low-balance-threshold": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Low Balance Threshold
         * @description Return the effective low balance config (system defaults merged with
         *     user overrides) without creating a DB row.
         */
        get: operations["get_low_balance_threshold_users_me_low_balance_threshold_get"];
        /**
         * Update Low Balance Threshold
         * @description Update low balance threshold configuration for the user.
         */
        put: operations["update_low_balance_threshold_users_me_low_balance_threshold_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/low-balance-webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Low Balance Webhook
         * @description The URL that gets the signed `low_balance`, `balance_grace_started` and `pods_stopped_insufficient_balance`
         *     events (the secret is never read back).
         */
        get: operations["get_low_balance_webhook_users_me_low_balance_webhook_get"];
        /**
         * Set Low Balance Webhook
         * @description Set the webhook URL (public HTTPS only) and get a new signing secret; any earlier secret stops working.
         */
        put: operations["set_low_balance_webhook_users_me_low_balance_webhook_put"];
        post?: never;
        /** Delete Low Balance Webhook */
        delete: operations["delete_low_balance_webhook_users_me_low_balance_webhook_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/notification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Notification Setting
         * @description Return the effective notification settings without creating a DB row.
         *
         *     When no NotificationSetting row exists, ``low_balance`` defaults to True
         *     (the effective default), so the frontend checkbox renders as checked.
         */
        get: operations["get_notification_setting_users_me_notification_get"];
        /** Update Notification Setting */
        put: operations["update_notification_setting_users_me_notification_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/preference": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User Preference */
        get: operations["get_user_preference_users_me_preference_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/preference/default-template": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Clear Default Template */
        delete: operations["clear_default_template_users_me_preference_default_template_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/referral-payout-method": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Referral Payout Method
         * @description Update the user's preferred referral payout method (balance, USD via Stripe Connect, or crypto)
         */
        put: operations["update_referral_payout_method_users_me_referral_payout_method_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/stripe-customer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ensure Stripe Customer
         * @description The caller's Stripe customer, created on first use: the TAO and Alpha top-ups key the transfer on it.
         */
        post: operations["ensure_stripe_customer_users_me_stripe_customer_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/transfer-credit-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Transfer Credit History
         * @description Alias for transfer-history endpoint to maintain backward compatibility
         */
        get: operations["get_transfer_credit_history_users_me_transfer_credit_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/transfer-credits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Transfer Credits */
        post: operations["transfer_credits_users_me_transfer_credits_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/transfer-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Transfer History */
        get: operations["get_transfer_history_users_me_transfer_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/presigned-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate Presigned Url
         * @description Create an upload link for your avatar image.
         */
        post: operations["generate_presigned_url_users_presigned_url_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/request-reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Request Reset Password */
        post: operations["request_reset_password_users_request_reset_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reset Password */
        post: operations["reset_password_users_reset_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/nvml-driver/report-unknown": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Report Unknown Driver
         * @description Queue an unknown NVIDIA driver for official verification (DAH-2451).
         *
         *     The response carries no verdict: the driver is enqueued (once) and resolved
         *     asynchronously against NVIDIA's official installer, then published via shared config.
         */
        post: operations["report_unknown_driver_v1_nvml_driver_report_unknown_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/referral-weights": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Referral Weights
         * @description Epoch-stable public feed of each referrer's referral EMA keyed by SN51 hotkey.
         *
         *     A subnet validator polls this endpoint and pays the EMA through mining emission. The EMA
         *     values only change when the accrue task folds a new epoch (advancing
         *     ReferralFoldState.last_processed_epoch), so the fully-serialized response is cached in Redis
         *     under a key that includes that watermark. Two reads within the same fold-epoch return
         *     byte-identical bodies, and the watermark and weights can never straddle a fold commit
         *     (see :func:`_build_referral_weights_body`).
         */
        get: operations["get_referral_weights_v1_referral_weights_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shared-config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Shared Config */
        get: operations["get_shared_config_v1_shared_config_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/version": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Version
         * @description Return app start time, build and the optional API features this build serves (startup/liveness probe; readiness is /ready).
         */
        get: operations["get_version_version_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/volumes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all available volumes
         * @description Endpoint to retrieve all volumes.
         */
        get: operations["get_volumes_volumes_get"];
        put?: never;
        /**
         * Create a new volume
         * @description Endpoint to create a new volume.
         */
        post: operations["create_volume_volumes_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/volumes/{volume_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a volume
         * @description Endpoint to get a volume.
         */
        get: operations["get_volume_volumes__volume_id__get"];
        /**
         * Update a volume
         * @description Endpoint to update a volume.
         */
        put: operations["update_volume_volumes__volume_id__put"];
        post?: never;
        /**
         * Delete a volume
         * @description Endpoint to delete a volume.
         */
        delete: operations["delete_volume_volumes__volume_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/volumes/{volume_id}/current-stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get current volume size and file count
         * @description Get the current size and file count for a specific volume.
         *         This returns the most recent metrics collected by the system.
         */
        get: operations["get_current_volume_stats_volumes__volume_id__current_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/volumes/cost-summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get aggregated cost summary
         * @description Get a comprehensive cost summary for user's volumes including:
         *         - Total costs by type (storage, egress, requests, other)
         *         - Top 5 most expensive volumes
         *         - Summary statistics for the period
         *
         *         **Query Parameters:**
         *         - `start_date` (required): Start date in YYYY-MM-DD format
         *         - `end_date` (required): End date in YYYY-MM-DD format (max 3 months from start)
         */
        get: operations["get_volume_cost_summary_volumes_cost_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/volumes/costs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get volume cost breakdown
         * @description Retrieve volume costs with detailed breakdown by cost type.
         *
         *         **Query Parameters:**
         *         - `volume_id` (optional): Filter by specific volume
         *         - `group_by` (optional): Set to "date" to aggregate all volumes by date
         *         - `cost_type` (optional): Filter by cost type ("storage", "egress", "requests", "other", "custom_storage", "chargeable", "all")
         *         - `start_date` (required): Start date in YYYY-MM-DD format
         *         - `end_date` (required): End date in YYYY-MM-DD format (max 3 months from start)
         *         - `page` (optional): Page number for pagination (default: 1)
         *         - `limit` (optional): Items per page (default: 50, max: 100)
         *         - `include_deleted` (optional): Also list the billed days of volumes deleted since (default: false); rows carry `volume_deleted`
         *
         *         **Cost Types:**
         *         - `storage`: AWS S3 storage costs
         *         - `egress`: AWS Data transfer out costs
         *         - `requests`: All AWS request costs (Tier 1 + Tier 2)
         *         - `requests_tier1`: AWS PUT, POST, COPY, LIST requests
         *         - `requests_tier2`: AWS GET, SELECT, HEAD requests
         *         - `other`: Other AWS S3 related costs
         *         - `custom_storage`: The storage dollars charged to you for the day (the storage part of the volume's price; see the pricing FAQ)
         *         - `chargeable`: Cost actually charged to users (the storage part above plus egress at AWS cost)
         *         - `all`: All cost types (default)
         *
         *         **Examples:**
         *         - Get all costs: `GET /volumes/costs?start_date=2025-01-01&end_date=2025-01-31`
         *         - Get storage costs only: `GET /volumes/costs?cost_type=storage&start_date=2025-01-01&end_date=2025-01-31`
         *         - Get daily aggregated costs: `GET /volumes/costs?group_by=date&start_date=2025-01-01&end_date=2025-01-31`
         */
        get: operations["get_volume_costs_volumes_costs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspace-invitations/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Look at an invitation
         * @description No authentication: the token is the credential for looking, not for joining. Names the workspace, the role, the invited address masked (`d***@example.com`; a forwarded link must not hand the address to a stranger) and whether the invitation is still open, so the page can say what accepting means.
         */
        get: operations["preview_invitation_workspace_invitations__token__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspace-invitations/{token}/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Accept an invitation
         * @description The signed-in user joins with the invited role. The session's e-mail must be the invited address (403 otherwise) and verified (403 until it is); 410 once expired, 409 when already accepted, revoked, or the user is a member already. A token is accepted once.
         */
        post: operations["accept_invitation_workspace_invitations__token__accept_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List my workspaces
         * @description Every workspace the caller belongs to, oldest first, with the caller's role in each. Every account has at least its own "<name>'s workspace"; a user can belong to any number. With an API key: the one workspace the key acts in.
         */
        get: operations["list_workspaces_workspaces_get"];
        put?: never;
        /**
         * Create a workspace
         * @description The caller becomes its owner and its billing owner (the balance that pays for it).
         */
        post: operations["create_workspace_workspaces_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces/{workspace_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a workspace
         * @description Members only; a workspace the caller does not belong to answers 404 (so does any workspace other than its own for an API key).
         */
        get: operations["get_workspace_workspaces__workspace_id__get"];
        put?: never;
        post?: never;
        /**
         * Delete a workspace
         * @description Owners only. Soft delete: the workspace disappears from every endpoint; its audit log is kept.
         */
        delete: operations["delete_workspace_workspaces__workspace_id__delete"];
        options?: never;
        head?: never;
        /**
         * Rename a workspace
         * @description Owners and admins.
         */
        patch: operations["rename_workspace_workspaces__workspace_id__patch"];
        trace?: never;
    };
    "/workspaces/{workspace_id}/billing-owner/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Accept a pending billing-owner transfer
         * @description The member named in the pending transfer takes over: their balance pays from now on.
         */
        post: operations["accept_billing_owner_workspaces__workspace_id__billing_owner_accept_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces/{workspace_id}/billing-owner/transfer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Transfer billing ownership
         * @description Only the current billing owner (not admins, not other owners). Records a pending transfer that the named member, owners and admins included, accepts with `/billing-owner/accept`.
         */
        post: operations["transfer_billing_owner_workspaces__workspace_id__billing_owner_transfer_post"];
        /**
         * Cancel a pending billing-owner transfer
         * @description Either side (the billing owner or the member asked to take over) can withdraw it.
         */
        delete: operations["cancel_billing_owner_transfer_workspaces__workspace_id__billing_owner_transfer_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces/{workspace_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the workspace's audit log
         * @description Every change to the workspace, newest first: creation, renames, members added / removed / left, role changes, billing-owner transfers and their acceptance or cancellation, deletion. Each entry names the user who made it and the session or API key behind the request. Members only; an API key needs the `read` scope.
         */
        get: operations["get_workspace_events_workspaces__workspace_id__events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces/{workspace_id}/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List the pending invitations
         * @description Owners and admins. Accepted, revoked and expired invitations are not listed.
         */
        get: operations["list_invitations_workspaces__workspace_id__invitations_get"];
        put?: never;
        /**
         * Invite an e-mail address
         * @description Owners and admins invite one address (it need not have a Lium account yet) with a role; admins cannot grant `owner`. The address receives a link that is valid for seven days; a verified session on that address opens it and joins. 422 for anything but one plain address; 409 when the address is already a member or already invited, or the workspace holds 50 open invitations; 30/minute per client. `email_sent` false means the mail did not leave: revoke and invite again.
         */
        post: operations["invite_workspaces__workspace_id__invitations_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces/{workspace_id}/invitations/{invitation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Revoke a pending invitation
         * @description Owners and admins. The link in the e-mail stops working.
         */
        delete: operations["revoke_invitation_workspaces__workspace_id__invitations__invitation_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces/{workspace_id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List the members
         * @description Members only. `is_billing_owner` marks whose balance pays. An API key needs the `read` scope.
         */
        get: operations["list_members_workspaces__workspace_id__members_get"];
        put?: never;
        /**
         * Add a member
         * @description Owners and admins add an existing Lium account by e-mail with a role; admins cannot grant `owner`. 404 when no account has that e-mail, 409 when already a member.
         */
        post: operations["add_member_workspaces__workspace_id__members_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces/{workspace_id}/members/{member_user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove a member, or leave
         * @description With the caller's own id this is leaving; otherwise owners and admins remove. An owner can neither leave nor be removed until the owner role is handed to someone else (409), and the billing owner until billing ownership is transferred (409).
         */
        delete: operations["remove_member_workspaces__workspace_id__members__member_user_id__delete"];
        options?: never;
        head?: never;
        /**
         * Change a member's role
         * @description Owners set any role; admins move members between `admin` and `member` and cannot touch owners. The last owner cannot be demoted (409): promote another member first.
         */
        patch: operations["change_member_role_workspaces__workspace_id__members__member_user_id__patch"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * AccountAuditEventResponse
         * @description One recorded request (P87.14). `ip` is present only on the caller's own rows — a team admin sees what a
         *     member did, not from where; `request_id` is the X-Request-Id the client received, the same id the request's
         *     log lines and its Sentry event carry.
         */
        AccountAuditEventResponse: {
            /** Action */
            action: string;
            actor: components["schemas"]["AuditActor"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Ip */
            ip?: string | null;
            /** Method */
            method: string;
            /** Request Id */
            request_id?: string | null;
            /** Resource Id */
            resource_id?: string | null;
            /** Resource Type */
            resource_type?: string | null;
            /** Route */
            route: string;
            /** Source */
            source: string;
            /** Status Code */
            status_code: number;
            /** Summary */
            summary?: {
                [key: string]: unknown;
            } | null;
            /** User Agent */
            user_agent?: string | null;
            /** Workspace Id */
            workspace_id?: string | null;
        };
        /** AccountAuditPage */
        AccountAuditPage: {
            /** Items */
            items: components["schemas"]["AccountAuditEventResponse"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * ActorMetadata
         * @description Who performed the action the event records (DAH-2934).
         *
         *     Event.user_id is the account; with several API keys on one account it cannot say which of them
         *     acted. Stamped on insert from the request's auth (see models/event.py); absent on events written
         *     by workers and the validator consumer.
         */
        ActorMetadata: {
            /** Api Key Id */
            api_key_id?: string | null;
            /** Api Key Name */
            api_key_name?: string | null;
            /** Auth */
            auth: string;
        };
        /** AddCardRequest */
        AddCardRequest: {
            /**
             * Auto Top Up Consent
             * @default false
             */
            auto_top_up_consent: boolean;
            /** Payment Method Id */
            payment_method_id: string;
        };
        /**
         * AddCryptoWalletRequest
         * @description Request to add a new crypto wallet.
         */
        AddCryptoWalletRequest: {
            /**
             * Is Default
             * @description Set as default wallet
             * @default false
             */
            is_default: boolean;
            /**
             * Network
             * @description Network name (e.g., 'ethereum')
             */
            network: string;
            /**
             * Token
             * @description Token type (e.g., 'USDT')
             */
            token: string;
            /**
             * Wallet Address
             * @description Wallet address
             */
            wallet_address: string;
        };
        /** AddMultipleSshKeysToPodRequest */
        AddMultipleSshKeysToPodRequest: {
            /** User Public Keys */
            user_public_keys: string[];
        };
        /** ApiCardTopUpRequest */
        ApiCardTopUpRequest: {
            /**
             * Amount Usd
             * @description Amount to add to the balance, in USD. Charged in whole cents: a third decimal is rounded half-up (10.005 → 10.01) and the response echoes the amount charged.
             */
            amount_usd: number;
            /**
             * Idempotency Key
             * @description Repeat a call with the same key and amount and you get the first call's transaction back: answered from our records once it is settled, from the payment's current state in Stripe while it is still pending (neither charges again), replayed by Stripe (within 24 h) when the first answer was lost. Required: if the HTTP response is lost the caller still has the key, so a retry cannot open a second charge.
             */
            idempotency_key: string;
            /**
             * Payment Method Id
             * @description A saved card (`GET /stripe/payments/payment-methods`). Omitted: the default card.
             */
            payment_method_id?: string | null;
        };
        /**
         * ApiCardTopUpResponse
         * @description 200 `succeeded` only when the row is COMPLETED (the webhook credited the balance). 202 `processing`
         *     until then: first call, a repeat, Stripe still processing, or Stripe's answer to the charge call was
         *     lost. First and repeated calls read that same row, so a succeeded PaymentIntent stays `processing`
         *     until the credit. The `charge.updated` webhook credits the balance, the same path a Checkout top-up
         *     takes. `transaction_id` is the row it settles (`GET /transactions`). The caller always sends
         *     `idempotency_key`: a lost HTTP answer plus a retry with that key cannot charge twice. The same key
         *     with a different amount is a new charge.
         */
        ApiCardTopUpResponse: {
            /** Amount Usd */
            amount_usd: number;
            card: components["schemas"]["ToppedUpCard"];
            /**
             * Idempotency Key
             * @description The caller's key; a retry with this key cannot charge twice.
             */
            idempotency_key: string;
            /**
             * Payment Intent Id
             * @description None when Stripe's answer to the charge call was lost.
             */
            payment_intent_id: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "succeeded" | "processing";
            /** Transaction Id */
            transaction_id: string;
        };
        /**
         * ApiKeyBudgetRefusalResponse
         * @description One refusal the key's budgets made: the `api_key_budget_refused` ledger row. `route` is the
         *     request that was refused as `METHOD /path/template`; `amount_usd` what it asked for (15 minutes of the
         *     pod's price on a new rental, an hour on a duration change, the sum on a top-up or transfer); `window`
         *     which budget it hit.
         */
        ApiKeyBudgetRefusalResponse: {
            /** Amount Usd */
            amount_usd: number;
            /** Budget Usd */
            budget_usd: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Route */
            route: string;
            /** Spent Usd */
            spent_usd: number;
            /**
             * Window
             * @enum {string}
             */
            window: "daily" | "monthly" | "max";
        };
        /** ApiKeyCreateRequest */
        ApiKeyCreateRequest: {
            /**
             * Customer Ref
             * @description Your tag for the end customer this key serves: 1-64 characters, letters, digits, . _ : -
             */
            customer_ref?: string | null;
            /**
             * Daily Budget Usd
             * @description Most USD this key may spend on one UTC day: the pod charges attributed to it plus, for a `billing` key, the top-ups and transfers it makes. At or past it the key's pods are deleted through the worker, not stopped; data outside a volume or backup is lost. A rental, a pod duration change or a top-up that would pass it answers 402 API_KEY_BUDGET_EXCEEDED. At least $1, cents at most; null = no budget.
             */
            daily_budget_usd?: number | string | null;
            /**
             * Max Budget Usd
             * @description Most USD this key may spend over the key's lifetime: the pod charges attributed to it plus, for a `billing` key, the top-ups and transfers it makes. At or past it the key's pods are deleted through the worker, not stopped; data outside a volume or backup is lost. A rental, a pod duration change or a top-up that would pass it answers 402 API_KEY_BUDGET_EXCEEDED. At least $1, cents at most; null = no budget.
             */
            max_budget_usd?: number | string | null;
            /**
             * Monthly Budget Usd
             * @description Most USD this key may spend in one UTC calendar month: the pod charges attributed to it plus, for a `billing` key, the top-ups and transfers it makes. At or past it the key's pods are deleted through the worker, not stopped; data outside a volume or backup is lost. A rental, a pod duration change or a top-up that would pass it answers 402 API_KEY_BUDGET_EXCEEDED. At least $1, cents at most; null = no budget.
             */
            monthly_budget_usd?: number | string | null;
            /** Name */
            name: string;
            /**
             * Pod Visibility
             * @description own: only the pods this key creates exist for it. account: every pod of the account, within the key's scopes. Omitted: the server default.
             */
            pod_visibility?: ("own" | "account") | null;
            /** Scopes */
            scopes?: ("read" | "rent" | "manage" | "billing")[] | null;
        };
        /**
         * ApiKeyPatchRequest
         * @description PATCH /keys/{id} sets or clears the key's budgets and its end-customer tag: `{"daily_budget_usd": 25}`
         *     sets one budget, `{"daily_budget_usd": null}` clears it; `{"customer_ref": "acme-42"}` sets the tag,
         *     `{"customer_ref": null}` clears it. A field the body does not name is left as it is; rentals already
         *     recorded keep the tag they were opened under. Scopes and pod visibility stay fixed at creation like on
         *     PUT; an unknown field is a 422, a body naming nothing a 400.
         */
        ApiKeyPatchRequest: {
            /**
             * Customer Ref
             * @description Your tag for the end customer this key serves (null clears it): 1-64 characters, letters, digits, . _ : -
             */
            customer_ref?: string | null;
            /**
             * Daily Budget Usd
             * @description Most USD this key may spend on one UTC day: the pod charges attributed to it plus, for a `billing` key, the top-ups and transfers it makes. At or past it the key's pods are deleted through the worker, not stopped; data outside a volume or backup is lost. A rental, a pod duration change or a top-up that would pass it answers 402 API_KEY_BUDGET_EXCEEDED. At least $1, cents at most; null = no budget.
             */
            daily_budget_usd?: number | string | null;
            /**
             * Max Budget Usd
             * @description Most USD this key may spend over the key's lifetime: the pod charges attributed to it plus, for a `billing` key, the top-ups and transfers it makes. At or past it the key's pods are deleted through the worker, not stopped; data outside a volume or backup is lost. A rental, a pod duration change or a top-up that would pass it answers 402 API_KEY_BUDGET_EXCEEDED. At least $1, cents at most; null = no budget.
             */
            max_budget_usd?: number | string | null;
            /**
             * Monthly Budget Usd
             * @description Most USD this key may spend in one UTC calendar month: the pod charges attributed to it plus, for a `billing` key, the top-ups and transfers it makes. At or past it the key's pods are deleted through the worker, not stopped; data outside a volume or backup is lost. A rental, a pod duration change or a top-up that would pass it answers 402 API_KEY_BUDGET_EXCEEDED. At least $1, cents at most; null = no budget.
             */
            monthly_budget_usd?: number | string | null;
        };
        /**
         * ApiKeyResponse
         * @description One row of `GET /keys` / the body of `GET|PUT|PATCH /keys/{id}`: an allow-list, so the hash and the
         *     ciphertext are never sent. `key` is the whole key for a regular key (copyable any time) and the
         *     prefix and a mask for a `billing` key, which POST /keys shows once (`key_retrievable` false). What the key
         *     has spent and what it was refused come with it. The `spent_*` fields sum the ledger rows stamped with the key; a key
         *     whose pods were all billed before the stamp existed shows 0. `refused_today` counts this UTC day's budget
         *     refusals; `last_refusal` is the newest one ever, null for a key never refused.
         */
        ApiKeyResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By User Id */
            created_by_user_id: string | null;
            /** Customer Ref */
            customer_ref: string | null;
            /** Daily Budget Usd */
            daily_budget_usd: number | null;
            /** Expires At */
            expires_at: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Key */
            key: string;
            /** Key Prefix */
            key_prefix: string | null;
            /** Key Retrievable */
            key_retrievable: boolean;
            last_refusal: components["schemas"]["ApiKeyBudgetRefusalResponse"] | null;
            /** Last Used */
            last_used: string | null;
            /** Masked Key */
            readonly masked_key: string;
            /** Max Budget Usd */
            max_budget_usd: number | null;
            /** Monthly Budget Usd */
            monthly_budget_usd: number | null;
            /** Name */
            name: string;
            /** Pod Visibility */
            pod_visibility: string;
            /** Pods Count */
            pods_count: number;
            /** Refused Today */
            refused_today: number;
            /** Scopes */
            scopes: string[];
            /** Spent Month Usd */
            spent_month_usd: number;
            /** Spent Today Usd */
            spent_today_usd: number;
            /** Spent Total Usd */
            spent_total_usd: number;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
            /** Workspace Id */
            workspace_id: string | null;
        };
        /**
         * ApiKeyUpdateRequest
         * @description PUT /keys/{id} renames a key. Scopes are fixed at creation (a key already handed out must not widen);
         *     a body that carries `scopes` is refused instead of silently ignored (arhangel66, #208).
         */
        ApiKeyUpdateRequest: {
            /** Name */
            name: string;
        };
        /**
         * ApiPlan
         * @enum {string}
         */
        ApiPlan: "free" | "pro";
        /** ApiPlanResponse */
        ApiPlanResponse: {
            /** Auto Renew */
            auto_renew: boolean;
            /** Display Name */
            display_name: string;
            /** Endpoints */
            endpoints: string[];
            /** Expires At */
            expires_at: string | null;
            plan: components["schemas"]["ApiPlan"];
            /** Pro For Sale */
            pro_for_sale: boolean;
            /** Pro Rate Limit Multiplier */
            pro_rate_limit_multiplier: number;
            /** Pro Usd Per Month */
            pro_usd_per_month: number;
            /** Rate Limit Multiplier */
            rate_limit_multiplier: number;
        };
        /**
         * AuditActor
         * @description Who made the request: the session's user or the API key (and the user who created it).
         */
        AuditActor: {
            /** Api Key Id */
            api_key_id?: string | null;
            /** Api Key Name */
            api_key_name?: string | null;
            /** Auth */
            auth: string;
            /** User Id */
            user_id?: string | null;
        };
        /** AutoRenewRequest */
        AutoRenewRequest: {
            /** Auto Renew */
            auto_renew: boolean;
        };
        /** AutoTopUp */
        AutoTopUp: {
            /** Amount To Top Up */
            amount_to_top_up: number;
            /**
             * Consecutive Declines
             * @default 0
             */
            consecutive_declines: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Decline Email Sent At */
            decline_email_sent_at?: string | null;
            /** Declined Payment Method Id */
            declined_payment_method_id?: string | null;
            /** First Charge Notice Dismissed At */
            first_charge_notice_dismissed_at?: string | null;
            /** First Charge Usd */
            first_charge_usd?: number | null;
            /** First Charged At */
            first_charged_at?: string | null;
            /** Last Decline Code */
            last_decline_code?: string | null;
            /** Last Decline Message */
            last_decline_message?: string | null;
            /** Next Retry At */
            next_retry_at?: string | null;
            /** Paused At */
            paused_at?: string | null;
            /** Pending Charged At */
            pending_charged_at?: string | null;
            /** Pending Payment Intent Id */
            pending_payment_intent_id?: string | null;
            /** Server Error Attempts */
            server_error_attempts?: number | null;
            /** Threshold */
            threshold: number;
            /** Turned On By Default At */
            turned_on_by_default_at?: string | null;
            /** Updated At */
            updated_at?: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** AutoTopUpUpdateDto */
        AutoTopUpUpdateDto: {
            /** Amount To Top Up */
            amount_to_top_up: number;
            /** Threshold */
            threshold: number;
        };
        /** AvailableCountExecutorResponse */
        AvailableCountExecutorResponse: {
            /** Count */
            count: number;
        };
        /**
         * AverageNetworkSpeedResponse
         * @description Average network speed statistics.
         */
        AverageNetworkSpeedResponse: {
            /**
             * Average Download Speed Mbps
             * @description Average download speed in Mbps
             */
            average_download_speed_mbps: number;
            /**
             * Average Upload Speed Mbps
             * @description Average upload speed in Mbps
             */
            average_upload_speed_mbps: number;
            /**
             * Total Machines With Network Data
             * @description Number of machines with network data
             */
            total_machines_with_network_data: number;
        };
        /** BackupConfiguration */
        BackupConfiguration: {
            /**
             * Auto Created
             * @default false
             */
            auto_created: boolean;
            /**
             * Backup Frequency Hours
             * @default 6
             */
            backup_frequency_hours: number;
            /** Backup Path */
            backup_path: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Created By Api Key Id */
            created_by_api_key_id?: string | null;
            /** Deleted At */
            deleted_at?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id?: string;
            /**
             * Is Active
             * @default true
             */
            is_active: boolean;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Retention Days */
            retention_days: number;
            /** Updated At */
            updated_at?: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
            /** Workspace Id */
            workspace_id?: string | null;
        };
        /** BackupConfigurationCreateRequest */
        BackupConfigurationCreateRequest: {
            /** Backup Frequency Hours */
            backup_frequency_hours: number;
            /** Backup Path */
            backup_path: string;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Retention Days */
            retention_days: number;
        };
        /** BackupConfigurationUpdateRequest */
        BackupConfigurationUpdateRequest: {
            /** Backup Frequency Hours */
            backup_frequency_hours: number;
            /** Backup Path */
            backup_path: string;
            /** Retention Days */
            retention_days: number;
        };
        /** BackupLogEnhancedResponse */
        BackupLogEnhancedResponse: {
            /** Backup Engine */
            backup_engine: string;
            /** Backup Estimate Warning Code */
            backup_estimate_warning_code?: string | null;
            /** Backup Type */
            backup_type: string;
            /** Completed At */
            completed_at?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Deletion State */
            deletion_state?: string | null;
            /** Description */
            description?: string | null;
            /** Elapsed Seconds */
            elapsed_seconds?: number | null;
            /** Error Message */
            error_message?: string | null;
            /** Estimated Backup Size Bytes */
            estimated_backup_size_bytes?: number | null;
            /** Estimated Remaining Seconds */
            estimated_remaining_seconds?: number | null;
            /** Estimated Upload Seconds */
            estimated_upload_seconds?: number | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Heartbeat At */
            last_heartbeat_at?: string | null;
            /** Name */
            name?: string | null;
            /** Physical Cleanup At */
            physical_cleanup_at?: string | null;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Processed Bytes */
            processed_bytes?: number | null;
            /** Processed Files */
            processed_files?: number | null;
            /** Progress */
            progress: number;
            /** Result Quality */
            result_quality?: string | null;
            /** S3 Content Length */
            s3_content_length?: number | null;
            /** S3 Etag */
            s3_etag?: string | null;
            /** S3 Last Modified */
            s3_last_modified?: string | null;
            /** S3 Verified At */
            s3_verified_at?: string | null;
            /** Snapshot Id */
            snapshot_id?: string | null;
            /** Stage */
            stage?: string | null;
            /** Started At */
            started_at?: string | null;
            /** Status */
            status: string;
            /** Status Message */
            status_message?: string | null;
            /** Throughput Bytes Per Second */
            throughput_bytes_per_second?: number | null;
            /** Total Bytes */
            total_bytes?: number | null;
            /** Total Files */
            total_files?: number | null;
        };
        /** BackupLogResponse */
        BackupLogResponse: {
            /**
             * Backup Config Id
             * Format: uuid
             */
            backup_config_id: string;
            /** Backup Engine */
            backup_engine: string;
            /** Backup Estimate Warning Code */
            backup_estimate_warning_code?: string | null;
            /**
             * Backup Volume Id
             * Format: uuid
             */
            backup_volume_id: string;
            /** Completed At */
            completed_at?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Deletion State */
            deletion_state?: string | null;
            /** Description */
            description?: string | null;
            /** Elapsed Seconds */
            elapsed_seconds?: number | null;
            /** Error Message */
            error_message?: string | null;
            /** Estimated Backup Size Bytes */
            estimated_backup_size_bytes?: number | null;
            /** Estimated Remaining Seconds */
            estimated_remaining_seconds?: number | null;
            /** Estimated Upload Seconds */
            estimated_upload_seconds?: number | null;
            /**
             * Failed At
             * @description When the backup was marked FAILED (UTC).
             */
            failed_at?: string | null;
            /**
             * Failure Reason
             * @description Why a FAILED backup failed, as `<code>: <detail>`. Codes: `heartbeat_timeout` (the node stopped reporting; says how long before the failure its last report was), `cancel_timeout` (the node kept reporting but never honoured a cancel; says how long ago it was asked), `executor_error` (the node reported the failure; its message or exit code), `completion_rejected` (the node reported success without a snapshot), `dispatch_failed` (the backup could not be handed to the node). Null on non-failed backups, on backups failed before this field existed, and on the legacy engine.
             */
            failure_reason?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Heartbeat At */
            last_heartbeat_at?: string | null;
            /** Name */
            name?: string | null;
            /** Physical Cleanup At */
            physical_cleanup_at?: string | null;
            /** Processed Bytes */
            processed_bytes?: number | null;
            /** Processed Files */
            processed_files?: number | null;
            /** Progress */
            progress: number;
            /** Result Quality */
            result_quality?: string | null;
            /** S3 Content Length */
            s3_content_length?: number | null;
            /** S3 Etag */
            s3_etag?: string | null;
            /** S3 Last Modified */
            s3_last_modified?: string | null;
            /** S3 Verified At */
            s3_verified_at?: string | null;
            /** Snapshot Id */
            snapshot_id?: string | null;
            /** Stage */
            stage?: string | null;
            /** Started At */
            started_at?: string | null;
            /** Status */
            status: string;
            /** Status Message */
            status_message?: string | null;
            /** Throughput Bytes Per Second */
            throughput_bytes_per_second?: number | null;
            /** Total Bytes */
            total_bytes?: number | null;
            /** Total Files */
            total_files?: number | null;
        };
        /** BackupProgressUpdateRequest */
        BackupProgressUpdateRequest: {
            /** Error Message */
            error_message?: string | null;
            /** Estimated Backup Size Bytes */
            estimated_backup_size_bytes?: number | null;
            /** Exit Code */
            exit_code?: number | null;
            /** Logs */
            logs?: string[] | null;
            /** Operation Id */
            operation_id?: string | null;
            /** Processed Bytes */
            processed_bytes?: number | null;
            /** Processed Files */
            processed_files?: number | null;
            /** Progress */
            progress: number;
            /** Result Quality */
            result_quality?: string | null;
            /** S3 Content Length */
            s3_content_length?: number | null;
            /** S3 Etag */
            s3_etag?: string | null;
            /** S3 Last Modified */
            s3_last_modified?: string | null;
            /** Snapshot Id */
            snapshot_id?: string | null;
            /** Stage */
            stage?: string | null;
            /** Status */
            status: string;
            /** Total Bytes */
            total_bytes?: number | null;
            /** Total Files */
            total_files?: number | null;
        };
        /** BaseResponse */
        BaseResponse: {
            /** Message */
            message?: string | null;
            /** Success */
            success: boolean;
        };
        /** BillingHistoryForMinerResponse */
        BillingHistoryForMinerResponse: {
            /** Amount */
            amount: number;
            /** Billing Day */
            billing_day: string;
            /** Declined Reason */
            declined_reason?: string | null;
            /** Executor Gpu Count */
            executor_gpu_count?: number | null;
            /** Executor Id In Subnet */
            executor_id_in_subnet?: string | null;
            /** Executor Price Per Gpu */
            executor_price_per_gpu?: number | null;
            executor_specs?: components["schemas"]["MachineSpecs"] | null;
            /** Is Declined For Miner Payment */
            is_declined_for_miner_payment?: boolean;
            /** Miner Amount */
            miner_amount: number;
            /** User Id */
            user_id?: string | null;
            /** Validator Hotkey */
            validator_hotkey: string;
        };
        /** BillingInfoForUserResponse */
        BillingInfoForUserResponse: {
            /** Amounts For Today */
            amounts_for_today: {
                [key: string]: unknown;
            }[];
            /** Average Amount Per Day */
            average_amount_per_day: number;
            /** Total Price Per Hour */
            total_price_per_hour: number;
            /** Total Price Per Hour For Pod */
            total_price_per_hour_for_pod: number;
            /** Total Price Per Hour For Volume */
            total_price_per_hour_for_volume: number;
        };
        /** BillingOwnerTransferRequest */
        BillingOwnerTransferRequest: {
            /**
             * User Id
             * Format: uuid
             * @description A member of the workspace whose balance will pay for it.
             */
            user_id: string;
        };
        /** BillingPerDayResponse */
        BillingPerDayResponse: {
            /** Amount */
            amount: number;
            /** Billing Day */
            billing_day: string;
            /** Billing Type */
            billing_type: string;
        };
        /** BillingProfileResponseDto */
        BillingProfileResponseDto: {
            /** Address Line1 */
            address_line1: string | null;
            /** Address Line2 */
            address_line2: string | null;
            /** City */
            city: string | null;
            /** Company Name */
            company_name: string | null;
            /** Country */
            country: string | null;
            /** Postal Code */
            postal_code: string | null;
            /** State */
            state: string | null;
            /** Stripe Error */
            stripe_error?: string | null;
            /** Stripe Synced At */
            stripe_synced_at: string | null;
            /** Tax Id */
            tax_id: string | null;
            /** Tax Id Type */
            tax_id_type: string | null;
        };
        /**
         * BillingProfileUpdateDto
         * @description PUT /users/me/billing-profile — every field optional; a blank or missing field clears it.
         *
         *     ``country`` is ISO 3166-1 alpha-2 and is required as soon as any other address field or
         *     the tax id is set, because the tax-id type is derived from it. ``tax_id`` is checked for
         *     the shape of that country's tax id (``utils.tax_id``) and stored normalized; the response
         *     carries the derived ``tax_id_type``.
         */
        BillingProfileUpdateDto: {
            /** Address Line1 */
            address_line1?: string | null;
            /** Address Line2 */
            address_line2?: string | null;
            /** City */
            city?: string | null;
            /** Company Name */
            company_name?: string | null;
            /** Country */
            country?: string | null;
            /** Postal Code */
            postal_code?: string | null;
            /** State */
            state?: string | null;
            /** Tax Id */
            tax_id?: string | null;
        };
        /** BillingStatementResponse */
        BillingStatementResponse: {
            /** End Day */
            end_day: string | null;
            /**
             * Pods
             * @description Most recently billed pod first.
             */
            pods: components["schemas"]["PodStatement"][];
            /** Start Day */
            start_day: string | null;
            /**
             * Total
             * @description Sum over pods.
             */
            total: number;
        };
        /** BucketBreakdown */
        BucketBreakdown: {
            /**
             * Emission Capped
             * @default false
             */
            emission_capped: boolean;
            /** Hourly Rate */
            hourly_rate: number;
            /** Max Cap */
            max_cap: number;
            /** Next Gpu Idle Rate */
            next_gpu_idle_rate: number | null;
            /** Unrented Count */
            unrented_count: number;
        };
        /** BucketCapacityRow */
        BucketCapacityRow: {
            /** Base Model */
            base_model: string;
            /** Buckets */
            buckets: {
                [key: string]: components["schemas"]["BucketBreakdown"];
            };
            /** Ineligible Buckets */
            ineligible_buckets?: {
                [key: string]: string;
            };
        };
        /** BuildContextUploadResponse */
        BuildContextUploadResponse: {
            /** Sha256 */
            sha256: string;
            /** Size Bytes */
            size_bytes: number;
        };
        /** BulkDeleteBackupLogsRequest */
        BulkDeleteBackupLogsRequest: {
            /** Backup Log Ids */
            backup_log_ids: string[];
        };
        /** Checksums */
        Checksums: {
            /** Docker */
            docker?: string | null;
            /** Libnvidia Ml */
            libnvidia_ml?: string | null;
            /** Nvidia Smi */
            nvidia_smi?: string | null;
        };
        /**
         * CliAuthApproveRequest
         * @description Request to approve CLI auth session
         */
        CliAuthApproveRequest: {
            /**
             * Api Key Name
             * @default CLI Generated Key
             */
            api_key_name: string | null;
            /** Session Id */
            session_id: string;
        };
        /**
         * CliAuthApproveResponse
         * @description Response for CLI auth approval
         */
        CliAuthApproveResponse: {
            /** Message */
            message: string;
            /** Success */
            success: boolean;
        };
        /**
         * CliAuthInitRequest
         * @description Request for initiating CLI auth session. The body is optional: the released `lium init` posts none.
         */
        CliAuthInitRequest: {
            /** Device Name */
            device_name?: string | null;
            /** Install Id */
            install_id?: string | null;
            /**
             * Read Only
             * @default false
             */
            read_only: boolean;
        };
        /**
         * CliAuthInitResponse
         * @description Response for CLI auth init containing session info
         */
        CliAuthInitResponse: {
            /** Browser Url */
            browser_url: string;
            /** Expires In Seconds */
            expires_in_seconds: number;
            /** Session Id */
            session_id: string;
        };
        /**
         * CliAuthPollResponse
         * @description Response for polling CLI auth session status
         */
        CliAuthPollResponse: {
            /** Api Key */
            api_key?: string | null;
            /** Expires At */
            expires_at?: string | null;
            /** Status */
            status: string;
        };
        /**
         * CliAuthStatusResponse
         * @description What the approval page shows about a CLI login request. Never the key.
         */
        CliAuthStatusResponse: {
            /** Created At */
            created_at: string;
            /** Expires At */
            expires_at: string;
            /** Requester Ip */
            requester_ip?: string | null;
            /** Requester User Agent */
            requester_user_agent?: string | null;
            /** Status */
            status: string;
        };
        /** ClusterDeleteResponse */
        ClusterDeleteResponse: {
            /**
             * Cluster Id
             * Format: uuid
             */
            cluster_id: string;
            /** Message */
            message: string;
            /** Pods */
            pods: components["schemas"]["ClusterMemberDeleteResult"][];
            /** Success */
            success: boolean;
        };
        /** ClusterMemberDeleteResult */
        ClusterMemberDeleteResult: {
            /** Cluster Node Index */
            cluster_node_index?: number | null;
            /** Message */
            message: string;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Pod Name */
            pod_name?: string | null;
            /** Success */
            success: boolean;
        };
        /** ClusterMemberFailure */
        ClusterMemberFailure: {
            /** Node Index */
            node_index: number;
            /** Pod Id */
            pod_id?: string | null;
            /** Reason */
            reason: string;
            /** Status */
            status?: string | null;
        };
        /** ClusterMemberStatus */
        ClusterMemberStatus: {
            /** Cluster Node Index */
            cluster_node_index?: number | null;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Pod Name */
            pod_name?: string | null;
            /** Status */
            status: string;
        };
        /** ClusterStatusResponse */
        ClusterStatusResponse: {
            /**
             * Cluster Id
             * Format: uuid
             */
            cluster_id: string;
            /** Member Failures */
            member_failures: components["schemas"]["ClusterMemberFailure"][];
            /** Node Count */
            node_count: number;
            /** Pods */
            pods: components["schemas"]["ClusterMemberStatus"][];
            /**
             * Start Deadline At
             * Format: date-time
             */
            start_deadline_at: string;
            /** Status */
            status: string;
        };
        /** CoinbaseCreateChargeRequest */
        CoinbaseCreateChargeRequest: {
            /** Amount */
            amount: number;
        };
        /** CountryStats */
        CountryStats: {
            /** Country */
            country: string;
            /** Nodes */
            nodes: number;
        };
        /** CpuSpec */
        CpuSpec: {
            /** Count */
            count: number;
            /** Model */
            model: string;
            /** Utilization */
            utilization?: number | null;
        };
        /** CreateCheckoutSessionRequest */
        CreateCheckoutSessionRequest: {
            /** Amount */
            amount: number;
            /** Cancel Url */
            cancel_url: string;
            /**
             * Mode
             * @default payment
             */
            mode: string;
            /**
             * Save Card
             * @default false
             */
            save_card: boolean;
            /** Success Url */
            success_url: string;
        };
        /** CreateConnectAccountRequest */
        CreateConnectAccountRequest: {
            /**
             * Country
             * @default US
             */
            country: string;
            /** Email */
            email?: string | null;
        };
        /** CreateOnboardingLinkRequest */
        CreateOnboardingLinkRequest: {
            /** Refresh Url */
            refresh_url: string;
            /** Return Url */
            return_url: string;
        };
        /** CreateProgress */
        CreateProgress: {
            /** Message */
            message: string | null;
            /** Stage */
            stage: string;
            /** Updated At */
            updated_at: string;
        };
        /** CreateSshKey */
        CreateSshKey: {
            /** Name */
            name?: string | null;
            /** Public Key */
            public_key: string;
        };
        /** CreateTransferRequest */
        CreateTransferRequest: {
            /** Amount */
            amount: number;
        };
        /** CreateTransferResponse */
        CreateTransferResponse: {
            /** Url */
            url: string;
        };
        /** CreateUserDto */
        CreateUserDto: {
            /** Custom Referral Code */
            custom_referral_code?: string | null;
            /** Device Traits */
            device_traits?: string | null;
            /** Email */
            email: string;
            /** Message */
            message?: string | null;
            /** Miner Referral Code */
            miner_referral_code?: string | null;
            /** Name */
            name: string;
            /** Partner Ref */
            partner_ref?: string | null;
            /** Password */
            password?: string | null;
            /** Referral Code */
            referral_code?: string | null;
            /** Signature */
            signature?: string | null;
            signup_attribution?: components["schemas"]["SignupAttributionDto"] | null;
            /** Validator Hotkey */
            validator_hotkey?: string | null;
        };
        /**
         * CreateUserFeedbackDto
         * @example {
         *       "category": "bug",
         *       "description": "When I try to deploy a pod with my custom Docker image, it fails with error...",
         *       "title": "Pod deployment fails with custom Docker image"
         *     }
         */
        CreateUserFeedbackDto: {
            /** @description Category of the feedback */
            category: components["schemas"]["FeedbackCategory"];
            /**
             * Description
             * @description Detailed description of the feedback
             */
            description: string;
            /**
             * Title
             * @description Title of the feedback
             */
            title: string;
        };
        /**
         * CryptoWalletResponse
         * @description Response model for crypto wallet.
         */
        CryptoWalletResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Default */
            is_default: boolean;
            /** Network */
            network: string;
            /** Token */
            token: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
            /** Wallet Address */
            wallet_address: string;
        };
        /**
         * CustomTemplateRequest
         * @example {
         *       "category": "UBUNTU",
         *       "container_start_immediately": false,
         *       "description": "Ubuntu Template",
         *       "docker_image": "ubuntu",
         *       "docker_image_digest": "sha256:e5a6aeef391a8a9bdaee3de6b28f393837c479d8217324a2340b64e45a81e0ef",
         *       "docker_image_tag": "20.04",
         *       "entrypoint": "",
         *       "environment": {
         *         "test_env": "44"
         *       },
         *       "internal_ports": [
         *         22,
         *         8002
         *       ],
         *       "is_private": true,
         *       "name": "Ubuntu",
         *       "readme": "# Ubuntu Template",
         *       "startup_commands": "bash -c 'apt update;apt install -y wget;DEBIAN_FRONTEND=noninteractive apt-get install openssh-server -y;mkdir -p /root/.ssh;cd $_;chmod 700 /root/.ssh;echo USER_PUBLIC_KEY > /root/.ssh/authorized_keys;chmod 700 /root/.ssh/authorized_keys;service ssh start; touch /root/container_ready; sleep infinity'",
         *       "volumes": [
         *         "/workspace"
         *       ]
         *     }
         */
        CustomTemplateRequest: {
            /** @default DOCKER */
            category: components["schemas"]["TemplateCategory"];
            /**
             * Container Start Immediately
             * @default true
             */
            container_start_immediately: boolean;
            /** Description */
            description?: string | null;
            /** Docker Credential Id */
            docker_credential_id?: string | null;
            /** Docker Image */
            docker_image: string;
            /**
             * Docker Image Digest
             * @default
             */
            docker_image_digest: string;
            /** Docker Image Size */
            docker_image_size?: number | null;
            /** Docker Image Tag */
            docker_image_tag?: string | null;
            /**
             * Entrypoint
             * @default
             */
            entrypoint: string;
            /**
             * Environment
             * @default {}
             */
            environment: {
                [key: string]: string;
            };
            /** Health Check Command */
            health_check_command?: string | null;
            /**
             * Internal Ports
             * @default []
             */
            internal_ports: number[];
            /**
             * Is Private
             * @default true
             */
            is_private: boolean;
            /**
             * Is Temporary
             * @default false
             */
            is_temporary: boolean;
            /**
             * Name
             * @default
             */
            name: string;
            /**
             * One Time Template
             * @default false
             */
            one_time_template: boolean;
            /** Readme */
            readme?: string | null;
            /**
             * Startup Commands
             * @default
             */
            startup_commands: string;
            /**
             * Supports Docker
             * @default false
             */
            supports_docker: boolean;
            /**
             * Supports Volume Encryption
             * @default false
             */
            supports_volume_encryption: boolean;
            /**
             * Volumes
             * @default [
             *       "/workspace"
             *     ]
             */
            volumes: string[];
        };
        /** DailyThroughput */
        DailyThroughput: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /**
             * Gmv Usd
             * @description USD billed to renters that UTC day.
             */
            gmv_usd: number;
            /**
             * Gpu Hours
             * @description GPU-hours rented that UTC day.
             */
            gpu_hours: number;
            /**
             * Rentals
             * @description Rentals started that UTC day, failed starts excluded.
             */
            rentals: number;
        };
        /** DailyUtilisation */
        DailyUtilisation: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /**
             * Utilisation
             * @description Share of the fleet's offered GPU-hours rented that UTC day, 0-1.
             */
            utilisation: number;
        };
        /** DefaultDockerImage */
        DefaultDockerImage: {
            /** Docker Image */
            docker_image: string;
            /** Docker Image Digest */
            docker_image_digest?: string | null;
            /** Docker Image Size */
            docker_image_size: number;
            /** Docker Image Tag */
            docker_image_tag: string;
            /**
             * Pre Pull
             * @default false
             */
            pre_pull: boolean;
        };
        /** DeploymentEstimateResponse */
        DeploymentEstimateResponse: {
            /** Docker Image Size */
            docker_image_size?: number | null;
            /** Estimated Seconds */
            estimated_seconds: number | null;
            /** Is Cached Template */
            is_cached_template: boolean;
            /** Is Slow Machine */
            is_slow_machine: boolean;
            /** Warning Message */
            warning_message: string | null;
        };
        /** DiscordOAuthAuthorizationUrlResponse */
        DiscordOAuthAuthorizationUrlResponse: {
            /** Authorization Url */
            authorization_url: string;
        };
        /** DiscordOAuthCallbackResponse */
        DiscordOAuthCallbackResponse: {
            /** Discord Id */
            discord_id: string;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * DiskHealthSpec
         * @description DAH-2929: the validator's disk probe (lium-io DAH-2928, lium-io#1278), one cycle's readings.
         *
         *     lium-io#1278 (15 Sep, value audit) sends four keys: ``docker_root_dir``, ``read_only_mounts``,
         *     ``write_probe`` and ``write_probe_error``. Each is what the scrape measured that cycle; None or
         *     empty where it could not. The dmesg, sysfs, NVMe and SMART readers were cut from the probe before
         *     it shipped and are not declared here; a follow-up in lium-io that re-adds a reader declares its key
         *     here in the same change.
         *
         *     CONTRACT OBLIGATION (same as GpuMetrics): MachineSpecs validates with Pydantic's default
         *     ``extra="ignore"``, so a probe key the validator starts emitting that is not declared here is
         *     stripped on the upsert, not stored. Declare it here to keep it.
         *
         *     Only PUBLIC_DISK_HEALTH_FIELDS leave the API on the anonymous routes (``ExecutorForPodResponse`` and
         *     ``BillingHistoryForMinerResponse`` serialize specs through ``public_specs_projection``;
         *     ``ExecutorForProviderResponse`` declares the same two fields in ``PublicDiskHealth``, DAH-3462): the
         *     free-text readings (docker root path, exception text) stay in the
         *     stored specs for operators. The machine request owner's ``GET /machine-requests/{id}/executors`` serves the
         *     row's address fields (DAH-2554: ip, ssh port, coldkey by design) and the projected specs (DAH-4180).
         */
        DiskHealthSpec: {
            /** Docker Root Dir */
            docker_root_dir?: string | null;
            /** Read Only Mounts */
            read_only_mounts?: string[] | null;
            /** Write Probe */
            write_probe?: string | null;
            /** Write Probe Error */
            write_probe_error?: string | null;
        };
        /**
         * DockerCredentialResponse
         * @description Docker credential as returned to the owner — deliberately without the password.
         */
        DockerCredentialResponse: {
            /** Created At */
            created_at: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Registry */
            registry?: string | null;
            /** Updated At */
            updated_at: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
            /** Username */
            username: string;
        };
        /** DockerCredentialUpdateCreateDto */
        DockerCredentialUpdateCreateDto: {
            /** Docker Password */
            docker_password: string;
            /** Docker Username */
            docker_username: string;
            /** Registry */
            registry?: string | null;
        };
        /** DockerSpec */
        DockerSpec: {
            /** Container Id */
            container_id?: string | null;
            /** Containers */
            containers?: {
                [key: string]: unknown;
            }[] | null;
            /** Host Cpu Percent */
            host_cpu_percent?: number | null;
            /** Version */
            version?: string | null;
        };
        /**
         * EffectiveLowBalanceConfigDto
         * @description Effective low-balance notification config: system defaults overlaid with
         *     user overrides. Additive superset of the original LowBalanceThreshold
         *     response -- ``user_id``/``created_at``/``updated_at`` are nullable (None
         *     when no DB row exists) and ``is_default`` is the new field.
         */
        EffectiveLowBalanceConfigDto: {
            /** Amount Threshold */
            amount_threshold?: number | null;
            /** Created At */
            created_at?: string | null;
            /** Enabled */
            enabled: boolean;
            /** Hours Threshold */
            hours_threshold?: number | null;
            /** Is Default */
            is_default: boolean;
            /** Last Notified At */
            last_notified_at?: string | null;
            /**
             * Notification Count
             * @default 0
             */
            notification_count: number;
            /** Updated At */
            updated_at?: string | null;
            /** User Id */
            user_id?: string | null;
        };
        /**
         * EffectiveNotificationSettingDto
         * @description Effective notification settings. ``low_balance`` reflects the effective
         *     default (True) when no NotificationSetting row exists, so the frontend
         *     checkbox renders as checked.
         */
        EffectiveNotificationSettingDto: {
            /**
             * Low Balance
             * @default true
             */
            low_balance: boolean;
            /**
             * Payment Receipt
             * @default false
             */
            payment_receipt: boolean;
            /**
             * Pod Deployed
             * @default false
             */
            pod_deployed: boolean;
            /**
             * Pod Unavailable
             * @default false
             */
            pod_unavailable: boolean;
        };
        /** EmailVerifyRequest */
        EmailVerifyRequest: {
            /** Token */
            token: string;
        };
        /** Executor */
        Executor: {
            /**
             * Active
             * @default true
             */
            active: boolean;
            /**
             * Availability Checked At
             * @description Scored-at time of the cycle that wrote availability_errors (DAH-2748)
             */
            availability_checked_at?: string | null;
            /**
             * Availability Errors
             * @description Reachability checks the last cycle failed, each with what we saw (DAH-2748)
             */
            availability_errors?: {
                [key: string]: unknown;
            }[];
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Executor Checked Ip */
            executor_checked_ip?: string | null;
            /**
             * Executor Id
             * Format: uuid
             */
            executor_id: string;
            /** Executor Ip Address */
            executor_ip_address: string;
            /** Executor Ip Port */
            executor_ip_port: string;
            /** Executor Ssh Port */
            executor_ssh_port?: string | null;
            /**
             * Finished Jobs
             * @default 0
             */
            finished_jobs: number;
            /** Gpu Count */
            gpu_count?: number | null;
            /**
             * Gpu Uuid Anchor
             * @description Smallest normalized GPU UUID on this machine; stable hardware anchor across hotkey/IP rotation
             */
            gpu_uuid_anchor?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id?: string;
            /**
             * Idle Pay Blockers
             * @description Why the last validator cycle paid no idle pay: its incentive_reasons as {code, context}; NULL until a cycle reports them
             */
            idle_pay_blockers?: {
                [key: string]: unknown;
            }[] | null;
            /**
             * Idle Pay Blockers At
             * @description Scored-at time of the cycle that wrote idle_pay_blockers
             */
            idle_pay_blockers_at?: string | null;
            /**
             * Is Responsive
             * @description Whether executor responds to health checks
             */
            is_responsive?: boolean | null;
            /** Last Counted Job Batch Id */
            last_counted_job_batch_id?: string | null;
            /**
             * Last Verified At
             * @description received_at of the newest passed validator report about this node, set by a trigger on executor_validation_report; the listing reads it instead of the report table. None until a passed report
             */
            last_verified_at?: string | null;
            /** Location Id */
            location_id: string | null;
            /** Machine Name */
            machine_name: string | null;
            /** Miner Coldkey */
            miner_coldkey?: string | null;
            /** Miner Hotkey */
            miner_hotkey: string;
            /**
             * Pending Price Per Hour
             * @description Pending price per hour that will be applied when price_change_effective_date is reached
             */
            pending_price_per_hour?: number | null;
            /** Previous Executor Ids */
            previous_executor_ids?: string[] | null;
            /**
             * Price Change Effective Date
             * @description Date when the pending price change will become effective
             */
            price_change_effective_date?: string | null;
            /** Price Per Gpu */
            price_per_gpu?: number | null;
            /** Price Per Hour */
            price_per_hour?: number | null;
            /**
             * Reclaimed
             * @default false
             */
            reclaimed: boolean;
            /** Reclaimed At */
            reclaimed_at?: string | null;
            /**
             * Rental Check Verified Status
             * @default RentalCheckVerifiedStatus.RENTAL_CHECK_PENDING
             */
            rental_check_verified_status: string | null;
            /**
             * Rental Verification Ssh Key Available
             * @description Whether rental verification SSH key was available in the subnet SSH keys
             */
            rental_verification_ssh_key_available?: boolean | null;
            specs: components["schemas"]["MachineSpecs"];
            /**
             * Unresponsive Since
             * @description When the 5-minute ping last flipped is_responsive to False; None while responsive. The provider portal shows it as 'port unreachable since'
             */
            unresponsive_since?: string | null;
            /** Updated At */
            updated_at?: string | null;
            /**
             * Uptime In Minutes
             * @default 0
             */
            uptime_in_minutes: number | null;
            /** Validator Hotkey */
            validator_hotkey: string;
            /**
             * Verified
             * @default false
             */
            verified: boolean;
            /** Verified Date */
            verified_date?: string | null;
        };
        /** ExecutorDetailResponse */
        ExecutorDetailResponse: {
            /** Active */
            active?: boolean | null;
            /** Available Gpu Count */
            available_gpu_count?: number | null;
            /**
             * Disk Health Ok
             * @description Whether the node's docker root takes writes (DAH-2929). True: no read-only mount over the
             *     docker root and the write probe did not fail. False: one of those; the readings behind it are
             *     in `specs.disk_health`. null: the validator has not probed this node this cycle.
             */
            readonly disk_health_ok: boolean | null;
            /** Distance Mile */
            distance_mile?: number | null;
            /** Effective Download Speed Mbps */
            effective_download_speed_mbps?: number | null;
            /** Effective Upload Speed Mbps */
            effective_upload_speed_mbps?: number | null;
            /**
             * Frequent Rent Failures
             * @description true when, in the last 7 days, at least 2 rents on this node failed to start for the host's reasons and they are at least 30% of its rents; the nodes `reliable_only=true` hides. Judged per node.
             * @default false
             */
            frequent_rent_failures: boolean;
            /**
             * Gpu Class
             * @description The GPU type this node is listed under: the canonical model name of the type, a value `machine_names` accepts and that matches every variant of the type (`NVIDIA B300 SXM6 AC` for a `NVIDIA B300 SXM6 PC` node). Equal to `machine_name` for a type with one model name; null without one.
             */
            readonly gpu_class: string | null;
            /**
             * Gpu Class Display
             * @description The GPU type's name for a filter or a list (`NVIDIA B300 SXM6`); the exact model stays in `machine_name`. Equal to `machine_name` for a type with one model name; null without one.
             */
            readonly gpu_class_display: string | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /**
             * Gpu Power Limit Default W
             * @description That GPU's default power limit in watts; null when gpu_power_limited is null.
             */
            gpu_power_limit_default_w?: number | null;
            /**
             * Gpu Power Limit W
             * @description Current power limit in watts of the most reduced GPU; null when gpu_power_limited is null.
             */
            gpu_power_limit_w?: number | null;
            /**
             * Gpu Power Limited
             * @description true when a GPU on this node runs under 95 % of its default power limit, so a rental gets less than the card's stock power; false when every GPU that reports a default is at it. null = cannot be judged: no GPU reports both limits, or a Lium default-job container is on the node and every GPU that reports sits at Pearl's own temporary cap (70 % of the default) or at the card's driver minimum, which Pearl's cap clamps to on cards whose minimum is above 70 % (RTX 4090, RTX 5090), so a host limit at that minimum is not judged while any Lium or miner default job runs; a host limit between the minimum and the default is.
             */
            gpu_power_limited?: boolean | null;
            /** Has No Pending Rental */
            has_no_pending_rental?: boolean | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Infiniband Fabric Rentable
             * @default false
             */
            infiniband_fabric_rentable: boolean;
            /** @description How the GPUs are wired to each other, from the validator's nvidia-smi topo run: nvlink/p2p verdicts, pair counts, PCIe class and the GPU x GPU matrix. null = no scrape has reported it for this host yet. A key the validator wrote in a shape the API cannot type is null on its own; the other keys stay. interconnect.nvlink is the topo -m reading alone; the top-level nvlink is that reading confirmed by the other tables. */
            interconnect?: components["schemas"]["InterconnectSpec"] | null;
            /**
             * Is Bookmarked
             * @default false
             */
            is_bookmarked: boolean;
            /** Is Responsive */
            is_responsive?: boolean | null;
            /**
             * Is Slow Machine
             * @default false
             */
            is_slow_machine: boolean;
            /** Is Whole Host Free */
            is_whole_host_free?: boolean | null;
            /**
             * Last Verified At
             * @description When the validator last passed this node: the newest positive validation report the backend received about it, UTC. The validator re-checks a listed node about every 15 minutes, so an older time means its recent checks failed or did not arrive. null = no passed check recorded yet.
             */
            last_verified_at?: string | null;
            location?: components["schemas"]["LocationResponseForExecutor"] | null;
            /** Machine Name */
            machine_name?: string | null;
            /** Max Cuda Version */
            max_cuda_version?: number | null;
            /** Min Gpu Count For Rental */
            min_gpu_count_for_rental?: number | null;
            /** Miner Hotkey */
            miner_hotkey?: string | null;
            /** Ncu Profiling Enabled */
            readonly ncu_profiling_enabled: boolean;
            /**
             * Nvlink
             * @description true when the validator saw every GPU pair joined by NVLink and confirmed it: P2P reads OK on every pair, every GPU has its NVLinks up and the topology covers every GPU. false when a pair is not on NVLink or a check contradicts it; null when the topology is unreported or unconfirmed, or the node has one GPU.
             */
            readonly nvlink: boolean | null;
            /**
             * Offers Bare Metal
             * @description The node's provider offers bare-metal rentals (POST /pods/{id}/bare-metal on a whole-node pod).
             * @default false
             */
            offers_bare_metal: boolean;
            /** On Infiniband Fabric */
            readonly on_infiniband_fabric: boolean;
            /** On Roce Fabric */
            readonly on_roce_fabric: boolean;
            /**
             * Operated By Lium
             * @default false
             */
            operated_by_lium: boolean;
            /** Pending Price Per Hour */
            pending_price_per_hour?: number | null;
            /** Price Change Effective Date */
            price_change_effective_date?: string | null;
            /** Price Per Gpu */
            price_per_gpu?: number | null;
            /** Provider Display Name */
            provider_display_name?: string | null;
            /** Reliability Score */
            reliability_score?: number | null;
            /**
             * Roce Fabric Rentable
             * @default false
             */
            roce_fabric_rentable: boolean;
            scheduled_notice?: components["schemas"]["ScheduledNoticeResponse"] | null;
            /** Specs */
            specs: {
                [key: string]: unknown;
            };
            /**
             * Tier
             * @default secure
             */
            tier: string | null;
            /** Uptime In Minutes */
            uptime_in_minutes?: number | null;
            /** Validator Hotkey */
            validator_hotkey: string;
        };
        /** ExecutorForPodResponse */
        ExecutorForPodResponse: {
            /** Active */
            active?: boolean | null;
            /** Available Gpu Count */
            available_gpu_count?: number | null;
            /**
             * Disk Health Ok
             * @description Whether the node's docker root takes writes (DAH-2929). True: no read-only mount over the
             *     docker root and the write probe did not fail. False: one of those; the readings behind it are
             *     in `specs.disk_health`. null: the validator has not probed this node this cycle.
             */
            readonly disk_health_ok: boolean | null;
            /** Effective Download Speed Mbps */
            effective_download_speed_mbps?: number | null;
            /** Effective Upload Speed Mbps */
            effective_upload_speed_mbps?: number | null;
            /** Executor Ip Address */
            executor_ip_address: string;
            /**
             * Frequent Rent Failures
             * @description true when, in the last 7 days, at least 2 rents on this node failed to start for the host's reasons and they are at least 30% of its rents; the nodes `reliable_only=true` hides. Judged per node.
             * @default false
             */
            frequent_rent_failures: boolean;
            /** Gpu Count */
            gpu_count?: number | null;
            /**
             * Gpu Power Limit Default W
             * @description That GPU's default power limit in watts; null when gpu_power_limited is null.
             */
            gpu_power_limit_default_w?: number | null;
            /**
             * Gpu Power Limit W
             * @description Current power limit in watts of the most reduced GPU; null when gpu_power_limited is null.
             */
            gpu_power_limit_w?: number | null;
            /**
             * Gpu Power Limited
             * @description true when a GPU on this node runs under 95 % of its default power limit, so a rental gets less than the card's stock power; false when every GPU that reports a default is at it. null = cannot be judged: no GPU reports both limits, or a Lium default-job container is on the node and every GPU that reports sits at Pearl's own temporary cap (70 % of the default) or at the card's driver minimum, which Pearl's cap clamps to on cards whose minimum is above 70 % (RTX 4090, RTX 5090), so a host limit at that minimum is not judged while any Lium or miner default job runs; a host limit between the minimum and the default is.
             */
            gpu_power_limited?: boolean | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** @description How the GPUs are wired to each other, from the validator's nvidia-smi topo run: nvlink/p2p verdicts, pair counts, PCIe class and the GPU x GPU matrix. null = no scrape has reported it for this host yet. A key the validator wrote in a shape the API cannot type is null on its own; the other keys stay. interconnect.nvlink is the topo -m reading alone; the top-level nvlink is that reading confirmed by the other tables. */
            interconnect?: components["schemas"]["InterconnectSpec"] | null;
            /** Is Responsive */
            is_responsive?: boolean | null;
            /**
             * Is Slow Machine
             * @default false
             */
            is_slow_machine: boolean;
            /**
             * Last Verified At
             * @description When the validator last passed this node: the newest positive validation report the backend received about it, UTC. The validator re-checks a listed node about every 15 minutes, so an older time means its recent checks failed or did not arrive. null = no passed check recorded yet.
             */
            last_verified_at?: string | null;
            location?: components["schemas"]["LocationResponseForExecutor"] | null;
            /** Machine Name */
            machine_name?: string | null;
            /** Miner Hotkey */
            miner_hotkey?: string | null;
            /** Ncu Profiling Enabled */
            readonly ncu_profiling_enabled: boolean;
            /**
             * Nvlink
             * @description true when the validator saw every GPU pair joined by NVLink and confirmed it: P2P reads OK on every pair, every GPU has its NVLinks up and the topology covers every GPU. false when a pair is not on NVLink or a check contradicts it; null when the topology is unreported or unconfirmed, or the node has one GPU.
             */
            readonly nvlink: boolean | null;
            /**
             * Offers Bare Metal
             * @description The node's provider offers bare-metal rentals (POST /pods/{id}/bare-metal on a whole-node pod).
             * @default false
             */
            offers_bare_metal: boolean;
            /** On Infiniband Fabric */
            readonly on_infiniband_fabric: boolean;
            /** On Roce Fabric */
            readonly on_roce_fabric: boolean;
            /** Pending Price Per Hour */
            pending_price_per_hour?: number | null;
            /** Price Change Effective Date */
            price_change_effective_date?: string | null;
            /** Price Per Gpu */
            price_per_gpu?: number | null;
            /** Reliability Score */
            reliability_score?: number | null;
            /** Specs */
            specs: {
                [key: string]: unknown;
            };
            /**
             * Tier
             * @default secure
             */
            tier: string | null;
            /** Uptime In Minutes */
            uptime_in_minutes?: number | null;
            /** Validator Hotkey */
            validator_hotkey: string;
        };
        /**
         * ExecutorForProviderResponse
         * @description Response model for node information in provider stats endpoint.
         */
        "ExecutorForProviderResponse-Input": {
            executor_info?: components["schemas"]["ExecutorPublicInfoResponse-Input"] | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Listing Hidden
             * @default false
             */
            listing_hidden: boolean;
            /**
             * Listing Hidden Reasons
             * @default []
             */
            listing_hidden_reasons: string[];
            location?: components["schemas"]["LocationResponse"] | null;
            /** Rented */
            rented: boolean;
            /**
             * Rented Gpu Count
             * @default 0
             */
            rented_gpu_count: number;
            /**
             * Rented Gpu Uuids
             * @default []
             */
            rented_gpu_uuids: string[];
            /**
             * Rented Since
             * @description Start of the oldest rental running on the node
             */
            rented_since?: string | null;
            /**
             * Revenue Per Hour
             * @default 0
             */
            revenue_per_hour: number;
        };
        /**
         * ExecutorForProviderResponse
         * @description Response model for node information in provider stats endpoint.
         */
        "ExecutorForProviderResponse-Output": {
            executor_info?: components["schemas"]["ExecutorPublicInfoResponse-Output"] | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Listing Hidden
             * @default false
             */
            listing_hidden: boolean;
            /**
             * Listing Hidden Reasons
             * @default []
             */
            listing_hidden_reasons: string[];
            location?: components["schemas"]["LocationResponse"] | null;
            /** Rented */
            rented: boolean;
            /**
             * Rented Gpu Count
             * @default 0
             */
            rented_gpu_count: number;
            /**
             * Rented Gpu Uuids
             * @default []
             */
            rented_gpu_uuids: string[];
            /**
             * Rented Since
             * @description Start of the oldest rental running on the node
             */
            rented_since?: string | null;
            /**
             * Revenue Per Hour
             * @default 0
             */
            revenue_per_hour: number;
        };
        /**
         * ExecutorPublicInfoResponse
         * @description The node row a stranger may read (DAH-3462): GET /provider-stats/{miner_hotkey}/executors answers without
         *     credentials because the marketplace provider page (/provider/{miner_hotkey}) shows it to signed-out visitors.
         *     So the row carries the fields the public /executors listing already publishes (dtos/executor.py
         *     ExecutorForPodResponse, `specs` cut down to ExecutorPublicSpecsResponse) plus the six that page shows and the
         *     listing does not (finished_jobs, verified, reclaimed, reclaimed_at, created_at). The rest of the Executor row
         *     stays private: the node's IP address and port, miner_coldkey, executor_id, executor_ssh_port, gpu_uuid_anchor,
         *     availability_errors and the other verification internals.
         */
        "ExecutorPublicInfoResponse-Input": {
            /** Active */
            active?: boolean | null;
            /** Available Gpu Count */
            available_gpu_count?: number | null;
            /** Created At */
            created_at?: string | null;
            /** Finished Jobs */
            finished_jobs?: number | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Machine Name */
            machine_name?: string | null;
            /** Miner Hotkey */
            miner_hotkey: string;
            /** Pending Price Per Hour */
            pending_price_per_hour?: number | null;
            /** Price Change Effective Date */
            price_change_effective_date?: string | null;
            /** Price Per Gpu */
            price_per_gpu?: number | null;
            /** Reclaimed */
            reclaimed?: boolean | null;
            /** Reclaimed At */
            reclaimed_at?: string | null;
            specs: components["schemas"]["ExecutorPublicSpecsResponse-Input"];
            /** Uptime In Minutes */
            uptime_in_minutes?: number | null;
            /** Validator Hotkey */
            validator_hotkey: string;
            /** Verified */
            verified?: boolean | null;
        };
        /**
         * ExecutorPublicInfoResponse
         * @description The node row a stranger may read (DAH-3462): GET /provider-stats/{miner_hotkey}/executors answers without
         *     credentials because the marketplace provider page (/provider/{miner_hotkey}) shows it to signed-out visitors.
         *     So the row carries the fields the public /executors listing already publishes (dtos/executor.py
         *     ExecutorForPodResponse, `specs` cut down to ExecutorPublicSpecsResponse) plus the six that page shows and the
         *     listing does not (finished_jobs, verified, reclaimed, reclaimed_at, created_at). The rest of the Executor row
         *     stays private: the node's IP address and port, miner_coldkey, executor_id, executor_ssh_port, gpu_uuid_anchor,
         *     availability_errors and the other verification internals.
         */
        "ExecutorPublicInfoResponse-Output": {
            /** Active */
            active?: boolean | null;
            /** Available Gpu Count */
            available_gpu_count?: number | null;
            /** Created At */
            created_at?: string | null;
            /** Finished Jobs */
            finished_jobs?: number | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Machine Name */
            machine_name?: string | null;
            /** Miner Hotkey */
            miner_hotkey: string;
            /** Pending Price Per Hour */
            pending_price_per_hour?: number | null;
            /** Price Change Effective Date */
            price_change_effective_date?: string | null;
            /** Price Per Gpu */
            price_per_gpu?: number | null;
            /** Reclaimed */
            reclaimed?: boolean | null;
            /** Reclaimed At */
            reclaimed_at?: string | null;
            specs: components["schemas"]["ExecutorPublicSpecsResponse-Output"];
            /** Uptime In Minutes */
            uptime_in_minutes?: number | null;
            /** Validator Hotkey */
            validator_hotkey: string;
            /** Verified */
            verified?: boolean | null;
        };
        /**
         * ExecutorPublicSpecsResponse
         * @description The part of the specs blob a stranger may read (DAH-3462): the keys of the /executors `view=summary` listing
         *     (services/executor.py LISTING_VIEWS) plus `hard_disk.utilization`, which the provider page reads, and the two
         *     public `disk_health` readings GET /executors serves (DAH-2929). Pydantic drops every other key on validation: the
         *     row also covers rented, unverified and reclaimed hosts that the public listing never shows, and their full blob
         *     carries the renter's docker containers, GPU processes with pids, GPU UUIDs, verified ports, checksums, the boot id
         *     and the raw disk probe.
         */
        "ExecutorPublicSpecsResponse-Input": {
            /** Available Port Count */
            available_port_count?: number | null;
            cpu?: components["schemas"]["PublicCpuSpec"] | null;
            disk_health?: components["schemas"]["PublicDiskHealth"] | null;
            gpu?: components["schemas"]["PublicGpuSpec"] | null;
            hard_disk?: components["schemas"]["PublicHardDiskSpec"] | null;
            network?: components["schemas"]["PublicNetworkSpec"] | null;
            ram?: components["schemas"]["PublicRamSpec"] | null;
            /** Sysbox Runtime */
            sysbox_runtime?: boolean | null;
        };
        /**
         * ExecutorPublicSpecsResponse
         * @description The part of the specs blob a stranger may read (DAH-3462): the keys of the /executors `view=summary` listing
         *     (services/executor.py LISTING_VIEWS) plus `hard_disk.utilization`, which the provider page reads, and the two
         *     public `disk_health` readings GET /executors serves (DAH-2929). Pydantic drops every other key on validation: the
         *     row also covers rented, unverified and reclaimed hosts that the public listing never shows, and their full blob
         *     carries the renter's docker containers, GPU processes with pids, GPU UUIDs, verified ports, checksums, the boot id
         *     and the raw disk probe.
         */
        "ExecutorPublicSpecsResponse-Output": {
            /** Available Port Count */
            available_port_count?: number | null;
            cpu?: components["schemas"]["PublicCpuSpec"] | null;
            disk_health?: components["schemas"]["PublicDiskHealth"] | null;
            gpu?: components["schemas"]["PublicGpuSpec"] | null;
            hard_disk?: components["schemas"]["PublicHardDiskSpec"] | null;
            network?: components["schemas"]["PublicNetworkSpec"] | null;
            ram?: components["schemas"]["PublicRamSpec"] | null;
            /** Sysbox Runtime */
            sysbox_runtime?: boolean | null;
        };
        /**
         * ExecutorSnapshotResponse
         * @description The complete rentable set, identical to the first frame of a WebSocket connection.
         */
        ExecutorSnapshotResponse: {
            /**
             * Executors
             * @description Every executor that is rentable right now, as an availability projection. The example below carries the complete card: the field set is fixed, and a value is `null` rather than absent when it is unknown.
             */
            executors: {
                [key: string]: unknown;
            }[];
            /**
             * Schema Version
             * @description Protocol version of the envelope. The current version is 1.
             */
            schema_version: number;
            /**
             * Seq
             * @description Sequence number of the last published frame. It orders frames within one WebSocket connection and carries no meaning across connections or replicas.
             */
            seq: number;
            /**
             * Ts
             * @description Server publish time of this snapshot, as Unix seconds.
             */
            ts: number;
            /**
             * Type
             * @constant
             */
            type: "snapshot";
        };
        /** ExecutorStatsResponse */
        ExecutorStatsResponse: {
            /** All Count */
            all_count: number;
            /** Gpu Type */
            gpu_type: string;
            /** Percentage */
            percentage: number;
            /** Rented Count */
            rented_count: number;
        };
        /**
         * FeedbackCategory
         * @enum {string}
         */
        FeedbackCategory: "bug" | "feature_request" | "general";
        /**
         * FeedbackRatesResponse
         * @description Feedback statistics.
         */
        FeedbackRatesResponse: {
            /**
             * Bad Feedbacks
             * @description Number of feedbacks with rating < 4
             */
            bad_feedbacks: number;
            /**
             * Good Feedbacks
             * @description Number of feedbacks with rating >= 4
             */
            good_feedbacks: number;
            /**
             * Good Percentage
             * @description Percentage of good feedbacks
             */
            good_percentage: number;
            /**
             * Total Feedbacks
             * @description Total number of feedbacks
             */
            total_feedbacks: number;
        };
        /**
         * FeedbackRequest
         * @example {
         *       "feedback_text": "Great service, very responsive support!",
         *       "rating": 5,
         *       "reason": "excellent_performance"
         *     }
         */
        FeedbackRequest: {
            /**
             * Feedback Text
             * @description User feedback content
             */
            feedback_text: string;
            /**
             * Rating
             * @description Rating from 1-5
             */
            rating?: number | null;
            /**
             * Reason
             * @description Reason for feedback
             */
            reason?: string | null;
        };
        /** FeedbackResponse */
        FeedbackResponse: {
            /** Executor Id */
            executor_id: string | null;
            /** Feedback Text */
            feedback_text: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Rating */
            rating: number | null;
            /** Reason */
            reason: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * FeedbackStatus
         * @enum {string}
         */
        FeedbackStatus: "new" | "in_progress" | "resolved" | "closed";
        /** FileInput */
        FileInput: {
            /**
             * Name
             * @default avatar.png
             */
            name: string;
            /**
             * Type
             * @default image/png
             * @enum {string}
             */
            type: "image/png" | "image/jpeg" | "image/gif" | "image/webp" | "image/avif" | "image/heic" | "image/heif";
        };
        /** FingerprintLoginRequest */
        FingerprintLoginRequest: {
            /** Fingerprint */
            fingerprint: string;
        };
        /** FingerprintSignupRequest */
        FingerprintSignupRequest: {
            /** Custom Referral Code */
            custom_referral_code?: string | null;
            /** Device Traits */
            device_traits?: string | null;
            /** Partner Ref */
            partner_ref?: string | null;
            /** Referral Code */
            referral_code?: string | null;
            signup_attribution?: components["schemas"]["SignupAttributionDto"] | null;
            /** Username */
            username?: string | null;
        };
        /** FingerprintSignupResponseDto */
        FingerprintSignupResponseDto: {
            /**
             * Api Key
             * @description API key for the new account. When present, it is usable right away as the `X-API-Key` header. Null if minting it failed.
             */
            api_key?: string | null;
            /**
             * Fingerprint
             * @description Account credential: a random 32-character string, not a passkey or biometrics. Shown once: it is the dashboard login and the only way to recover the account, so store it.
             */
            fingerprint: string;
            /**
             * Signup Credit Granted
             * @description Whether the one-time signup credit landed with this signup. True only when `ENABLE_FREE_CREDIT` is on, the account's trust tier is not high, no credited account shares its identity and no credit cap or daily budget was hit; false when it was withheld.
             * @default false
             */
            signup_credit_granted: boolean;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
            /** Username */
            username: string;
        };
        /** FleetStats */
        FleetStats: {
            /**
             * Countries
             * @description Countries with at least one listed node, rented or not.
             */
            countries: number;
            /** Gpu Models */
            gpu_models: number;
            /**
             * Gpus Listed
             * @description GPUs on verified, active nodes that take new rentals.
             */
            gpus_listed: number;
            /**
             * Gpus Rented
             * @description Of those, GPUs inside a running pod right now.
             */
            gpus_rented: number;
            /**
             * Providers
             * @description Providers with at least one listed node, rented or not.
             */
            providers: number;
            /**
             * Utilisation 30D
             * @description Share of offered GPU-hours rented over 30 days, 0-1, models past the floor only.
             */
            utilisation_30d?: number | null;
        };
        /**
         * GpuActivitySpec
         * @description One GPU's load at scrape time next to whether a rental held it — a rule input, not a verdict.
         *
         *     Derived by the backend on every validator report (`services/gpu_activity.py`, called from
         *     `worker.save_executor_into_db`), never sent by the validator. `util_pct` and `vram_used_mb` are
         *     `gpu.details[].gpu_utilization` / `memory_used_mb` of the same report; `no_pod` is "no
         *     `executor_gpu` row with this `uuid` has a `pod_id`" at save time — the backend's own record of
         *     which GPU a rental holds, which the scrape cannot see (its `gpu_processes` is read from inside
         *     the executor container, so a process on the host is invisible to it: rel-box-34 case 11, executor
         *     252f0496, 14-100 % utilisation for hours with no pod and `gpu_processes` `[]` in 672/672 snapshots).
         *
         *     `no_pod` says nothing about a default job (filler): a filler holds no `executor_gpu.pod_id`, so a
         *     GPU it uses reads `no_pod: true` with load. A consumer excludes fillers through
         *     `specs.docker.containers` (`filler_` prefix), as the loop's host-load detector already does.
         */
        GpuActivitySpec: {
            /** Index */
            index: number;
            /** No Pod */
            no_pod: boolean;
            /** Util Pct */
            util_pct?: number | null;
            /** Uuid */
            uuid?: string | null;
            /** Vram Total Mb */
            vram_total_mb?: number | null;
            /** Vram Used Mb */
            vram_used_mb?: number | null;
        };
        /** GpuDetail */
        GpuDetail: {
            /** Capacity */
            capacity: number;
            /** Cuda */
            cuda: string;
            /** Gpu Utilization */
            gpu_utilization?: number | null;
            /** Graphics Speed */
            graphics_speed: number;
            /** Memory Speed */
            memory_speed: number;
            /** Memory Used Mb */
            memory_used_mb?: number | null;
            /** Memory Utilization */
            memory_utilization?: number | null;
            /** Name */
            name: string;
            /** Pcie */
            pcie?: number | null;
            /** Pcie Speed */
            pcie_speed?: number | null;
            /** Power Default Limit */
            power_default_limit?: number | null;
            /** Power Limit */
            power_limit: number;
            /** Power Max Limit */
            power_max_limit?: number | null;
            /** Power Min Limit */
            power_min_limit?: number | null;
            /** Temperature */
            temperature?: number | null;
            /** Uuid */
            uuid: string;
        };
        /** GpuEstimateResponse */
        GpuEstimateResponse: {
            /** Estimate */
            estimate?: {
                [key: string]: unknown;
            } | null;
            /** Estimate Available */
            estimate_available: boolean;
            /** Gpu Count */
            gpu_count: number;
            /** Gpu Model */
            gpu_model: string;
            /** Is Rented */
            is_rented: boolean;
            /**
             * Over Soft Price Limit
             * @default false
             */
            over_soft_price_limit: boolean;
            /** Snapshot */
            snapshot?: {
                [key: string]: unknown;
            } | null;
            /** Soft Price Limit */
            soft_price_limit?: number | null;
            /** Usd Per Epoch */
            usd_per_epoch: number | null;
        };
        /** GpuLaunchStats */
        GpuLaunchStats: {
            /**
             * Gpu Count
             * @description GPUs per pod.
             */
            gpu_count: number;
            /**
             * Gpu Type
             * @description The GPU model as the node reports it, e.g. NVIDIA H100 80GB HBM3.
             */
            gpu_type: string;
            /**
             * Success Rate
             * @description Share of launches in the window that reached RUNNING, 0 to 1.
             */
            success_rate: number;
            /**
             * Time To Ssh P50 Seconds
             * @description Median seconds from the rent request to RUNNING.
             */
            time_to_ssh_p50_seconds: number | null;
            /**
             * Time To Ssh P90 Seconds
             * @description 90th percentile of the same; null when none succeeded.
             */
            time_to_ssh_p90_seconds: number | null;
        };
        /**
         * GpuMetrics
         * @description FP32 throughput metrics from libdmcompverify.so getMetrics() (device-0 representative).
         *
         *     All fields are optional: the .so may emit a subset, and the whole object is absent
         *     when TFLOPS benchmarking is disabled or fails (fail-safe).
         *
         *     CONTRACT OBLIGATION: this model mirrors getMetrics() output. Because MachineSpecs has
         *     `extra` unset (Pydantic defaults to ignore -> undeclared keys are stripped on
         *     validation), any NEW field that libdmcompverify.so's getMetrics() starts emitting MUST
         *     be added here too, or it is silently dropped on coercion. Adding the field here is the
         *     documented way to surface it; failing to do so is a silent-strip data-loss bug, not a
         *     crash.
         */
        GpuMetrics: {
            /** Cc */
            cc?: string | null;
            /** Clock Mhz */
            clock_mhz?: number | null;
            /** Device */
            device?: string | null;
            /** Fp32 Cov Pct */
            fp32_cov_pct?: number | null;
            /** Fp32 Median Tflops */
            fp32_median_tflops?: number | null;
            /** Fp32 Tflops */
            fp32_tflops?: number | null;
            /** N */
            n?: number | null;
            /** Sm Count */
            sm_count?: number | null;
            /** Vram Gb */
            vram_gb?: number | null;
        };
        /** GpuResetError */
        GpuResetError: {
            /** Code */
            code: string;
            /** Message */
            message: string;
        };
        /** GpuSpec */
        GpuSpec: {
            /** Count */
            count: number;
            /** Cuda Driver */
            cuda_driver?: number | null;
            /** Details */
            details: components["schemas"]["GpuDetail"][];
            /** Driver */
            driver?: string | null;
        };
        /** HardDiskSpec */
        HardDiskSpec: {
            /** Containers */
            containers?: number | null;
            /** Disk Type */
            disk_type?: ("nvme" | "ssd" | "hdd" | "unknown") | null;
            /** Engy Cache Used Gb */
            engy_cache_used_gb?: number | null;
            /** Free */
            free: number;
            /** Images */
            images?: number | null;
            /** Total */
            total: number;
            /** Used */
            used: number;
            /** Utilization */
            utilization?: number | null;
            /** Volumes */
            volumes?: number | null;
        };
        /**
         * HostLoadNodeResponse
         * @description DAH-3524 (R-84): one node of the provider that is marked under host load.
         */
        HostLoadNodeResponse: {
            /**
             * Executor Id
             * Format: uuid
             * @description The node id, as in every other executor endpoint
             */
            executor_id: string;
            /**
             * Reason
             * @description The refusal sentence without the GPU readings (this page is public)
             */
            reason: string;
            /**
             * Since
             * Format: date-time
             * @description When the scan marked the node (the third consecutive hot idle scan)
             */
            since: string;
        };
        /**
         * HostLoadResponse
         * @description DAH-3524 (R-84): the provider's nodes whose GPU was busy with no pod and no filler on them. Additive. This
         *     page is public, so the block is empty while the flag is off and never carries per-GPU readings.
         */
        HostLoadResponse: {
            /**
             * Enabled
             * @description Whether marked nodes are hidden from new rentals right now (the flag)
             * @default false
             */
            enabled: boolean;
            /**
             * Marked Node Count
             * @description Marked nodes of this provider
             * @default 0
             */
            marked_node_count: number;
            /** Nodes */
            nodes?: components["schemas"]["HostLoadNodeResponse"][];
            /**
             * Provider Origin
             * @description At least HOST_LOAD_NODES_FOR_HOTKEY of the provider's active nodes are marked: the host load is the provider's, not one machine's
             * @default false
             */
            provider_origin: boolean;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** IneligibleModel */
        IneligibleModel: {
            /** Model */
            model: string;
            /** Reason */
            reason: string;
        };
        /**
         * InfinibandClusterResponse
         * @description One fabric offered as a rentable group (DAH-2619).
         *
         *     `node_count` is the whole fabric while `nodes` holds only the members free right now — a buyer
         *     deciding whether an 8-node job can ever run here needs the first number, and the second list is
         *     what he can actually put in a cart. Renting is still per node: nothing here reserves the group.
         */
        InfinibandClusterResponse: {
            /** Fabric Id */
            fabric_id: string;
            /**
             * Fabric Measured
             * @default false
             */
            fabric_measured: boolean;
            /**
             * Fabric Type
             * @default infiniband
             */
            fabric_type: string;
            /** Link Rate */
            link_rate?: string | null;
            /** Node Count */
            node_count: number;
            /** Nodes */
            nodes: components["schemas"]["ExecutorDetailResponse"][];
        };
        /**
         * InfinibandPortSpec
         * @description One RDMA port as the executor's kernel reports it (DAH-2571).
         *
         *     `link_layer` is the ONLY safe way to tell InfiniBand from RoCE: mlx5 reports `lid` 0x0 on an
         *     Ethernet port but Intel irdma reports 0x1, measured on prod 2026-08-05.
         *
         *     What identifies a fabric: on InfiniBand, `sm_lid` with the LID set — a host running its own
         *     subnet manager reports `sm_lid` 0x1 pointing at its own port, so it is a one-host subnet, while
         *     an external switch-side SM shows up as something else (0xe on the one real multi-node fabric in
         *     the fleet). On RoCE it is the IPv4-mapped entry of `gids` — find it by the
         *     `0000:0000:0000:0000:0000:ffff:` prefix, never by index: mlx5 puts it at 2-3, Intel irdma at 1.
         *     The GID prefix is NOT usable — every prod port carries the default `fe80::`.
         *
         *     Those IPv4-mapped addresses are private (172.16/10.x observed on prod), so they identify a
         *     segment only WITHIN one provider — two providers can hand out the same one. Pair on them only
         *     together with something provider-scoped.
         *
         *     `rate` is meaningful only while `state` is ACTIVE; on a DOWN port the driver fills in a
         *     placeholder rather than the card's real capability.
         */
        InfinibandPortSpec: {
            /** Device */
            device?: string | null;
            /** Gids */
            gids?: string[] | null;
            /** Lid */
            lid?: string | null;
            /** Link Layer */
            link_layer?: string | null;
            /** Node Guid */
            node_guid?: string | null;
            /** Phys State */
            phys_state?: string | null;
            /** Pkey */
            pkey?: string | null;
            /** Port */
            port?: string | null;
            /** Rate */
            rate?: string | null;
            /** Sm Lid */
            sm_lid?: string | null;
            /** State */
            state?: string | null;
            /** Sys Image Guid */
            sys_image_guid?: string | null;
        };
        /** InstallJupyterRequest */
        InstallJupyterRequest: {
            /** Jupyter Internal Port */
            jupyter_internal_port: number;
        };
        /**
         * InterconnectSpec
         * @description How the GPUs of one host are wired to each other, from the validator's `nvidia-smi topo` run.
         *
         *     Scraped by lium-io DAH-2922, declared and exposed here (DAH-2923).
         *     `nvlink` is True only when EVERY GPU pair is joined by NVLink (an HGX board); a box with NVLink
         *     bridges on some pairs reports False with `nvlink_pairs` < `gpu_pairs`. `p2p` is True only when
         *     every pair of `nvidia-smi topo -p2p r` reads OK — False is the host where NCCL cannot start
         *     without NCCL_P2P_DISABLE=1. Both are None on a single-GPU host (nothing to judge) and when the
         *     table that answers them could not be read (`interconnect_scrape_error` on MachineSpecs says why).
         *     `pcie_class` is nvidia-smi's worst class among the non-NVLink pairs (SYS > NODE > PHB > PXB > PIX).
         *     `matrix` is the GPU x GPU cell table, kept so a client can print the topology.
         */
        InterconnectSpec: {
            /** Gpu Count */
            gpu_count?: number | null;
            /** Gpu Pairs */
            gpu_pairs?: number | null;
            /** Matrix */
            matrix?: string[][] | null;
            /** Nvlink */
            nvlink?: boolean | null;
            /** Nvlink Active Links */
            nvlink_active_links?: number | null;
            /** Nvlink Links */
            nvlink_links?: number | null;
            /** Nvlink Pairs */
            nvlink_pairs?: number | null;
            /** P2P */
            p2p?: boolean | null;
            /** P2P Ok Pairs */
            p2p_ok_pairs?: number | null;
            /** P2P Pairs */
            p2p_pairs?: number | null;
            /** Pcie Class */
            pcie_class?: string | null;
        };
        /**
         * JobQuoteAllocation
         * @description What the pod gets on this node for `gpu_count` GPUs: the rent path's own split.
         */
        JobQuoteAllocation: {
            /**
             * Cpu Count
             * @description CPU cores inside the pod
             */
            cpu_count: number | null;
            /**
             * Local Volume Gb
             * @description Local volume (/root) size if rented now; null when the node cannot cap disk per pod
             */
            local_volume_gb: number | null;
            /**
             * Ram Gb
             * @description RAM inside the pod, GiB (the host keeps its reserve)
             */
            ram_gb: number | null;
            /**
             * Share
             * @description gpu_count / the node's GPUs; CPU, RAM and disk follow it
             */
            share: number;
            /**
             * Storage Gb
             * @description Container writable layer quota if rented now; null as local_volume_gb
             */
            storage_gb: number | null;
        };
        /** JobQuoteLine */
        JobQuoteLine: {
            /**
             * Amount Usd
             * @description rate_usd x quantity; null when it cannot be quoted
             */
            amount_usd: number | null;
            /**
             * Item
             * @enum {string}
             */
            item: "compute" | "volume" | "backup" | "egress";
            /** Note */
            note: string;
            /** Quantity */
            quantity: number;
            /**
             * Rate Usd
             * @description USD per unit; null when the charge has no fixed rate
             */
            rate_usd: number | null;
            /**
             * Unit
             * @enum {string}
             */
            unit: "hour" | "GB-hour" | "GB";
        };
        /** JobQuoteResponse */
        JobQuoteResponse: {
            /** @description CPU, RAM and disk inside the pod for this gpu_count, as the rent assigns them */
            allocation?: components["schemas"]["JobQuoteAllocation"] | null;
            /**
             * Executor Id
             * Format: uuid
             */
            executor_id: string;
            /** Gpu Count */
            gpu_count: number;
            /** Hours */
            hours: number;
            /** Lines */
            lines: components["schemas"]["JobQuoteLine"][];
            /**
             * Pod Balance Floor Usd
             * @description 15 minutes of price_per_hour. A rent needs a balance of more than this plus 15 minutes of each open pod
             */
            pod_balance_floor_usd: number;
            /**
             * Price Per Hour
             * @description The pod's hourly price if rented now: price_per_gpu x gpu_count
             */
            price_per_hour: number;
            /**
             * Rent Balance Required Usd
             * @description Signed in: the amount the payer's balance must be more than for this rent, pod_balance_floor_usd plus 15 minutes of each open pod; 0 for an account the floor exempts. Null without authentication
             */
            rent_balance_required_usd?: number | null;
            /**
             * Total Usd
             * @description Sum of the quoted lines; egress is not included
             */
            total_usd: number;
        };
        /**
         * JupyterInstallationStatus
         * @enum {string}
         */
        JupyterInstallationStatus: "INSTALLING" | "SUCCESS" | "FAILED";
        /** LaunchStatsResponse */
        LaunchStatsResponse: {
            /**
             * Generated At
             * Format: date-time
             */
            generated_at: string;
            /** Gpus */
            gpus: components["schemas"]["GpuLaunchStats"][];
            /** Methodology Url */
            methodology_url: string;
            /**
             * Min Launches
             * @description A GPU type and count with fewer launches in the window is left out.
             */
            min_launches: number;
            /**
             * Min Providers
             * @description A GPU type and count launched on fewer providers in the window is left out.
             */
            min_providers: number;
            /** Window Days */
            window_days: number;
        };
        /**
         * LocationResponse
         * @description Location information for a machine.
         */
        LocationResponse: {
            /** City */
            city?: string | null;
            /** Country */
            country?: string | null;
            /** Country Code */
            country_code?: string | null;
            /** Latitude */
            latitude?: number | null;
            /** Longitude */
            longitude?: number | null;
            /** Region */
            region?: string | null;
            /** Timezone */
            timezone?: string | null;
        };
        /** LocationResponseForExecutor */
        LocationResponseForExecutor: {
            /** City */
            city?: string | null;
            /** Country */
            country: string;
            /** Country Code */
            country_code?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /**
             * Id
             * Format: uuid
             */
            id?: string;
            /** Lat */
            lat?: number | null;
            /** Lon */
            lon?: number | null;
            /** Region */
            region?: string | null;
            /** Region Name */
            region_name?: string | null;
            /** Source */
            source?: string | null;
            /** Timezone */
            timezone: string;
            /** Updated At */
            updated_at?: string | null;
            /** Zip */
            zip?: string | null;
        };
        /** LoginResponseDto */
        LoginResponseDto: {
            /** Token */
            token: string;
            user: components["schemas"]["UserResponseDto"];
        };
        /** LoginUserDto */
        LoginUserDto: {
            /** Email */
            email: string;
            /** Message */
            message?: string | null;
            /** Password */
            password?: string | null;
            /** Signature */
            signature?: string | null;
        };
        /** LowBalanceThreshold */
        LowBalanceThreshold: {
            /** Amount Threshold */
            amount_threshold?: number | null;
            /** Configured At */
            configured_at?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Enabled */
            enabled?: boolean | null;
            /** Hours Threshold */
            hours_threshold?: number | null;
            /** Last Notified At */
            last_notified_at?: string | null;
            /**
             * Notification Count
             * @default 0
             */
            notification_count: number;
            /** Updated At */
            updated_at?: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** LowBalanceThresholdUpdateDto */
        LowBalanceThresholdUpdateDto: {
            /** Amount Threshold */
            amount_threshold?: number | null;
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /** Hours Threshold */
            hours_threshold?: number | null;
        };
        /** LowBalanceWebhookDto */
        LowBalanceWebhookDto: {
            /**
             * Secret
             * @description HMAC-SHA256 signing secret; returned only by the PUT that sets the URL
             */
            secret?: string | null;
            /**
             * Url
             * @description The webhook URL, null when none is set
             */
            url: string | null;
        };
        /** LowBalanceWebhookUpdateDto */
        LowBalanceWebhookUpdateDto: {
            /**
             * Url
             * @description Public HTTPS URL that receives the signed balance events
             */
            url: string;
        };
        /** MachineListResponse */
        MachineListResponse: {
            /** Avg Rental Rate 30D */
            avg_rental_rate_30d?: number | null;
            /** Base Price */
            base_price: number;
            /**
             * Estimates Available
             * @default false
             */
            estimates_available: boolean;
            /**
             * Gpu Class
             * @description The GPU type this machine name belongs to: the canonical model name (`NVIDIA B300 SXM6 AC` for the `NVIDIA B300 SXM6 PC` row); equal to `name` for a type with one model name.
             */
            readonly gpu_class: string;
            /**
             * Gpu Class Display
             * @description The type's name for a list (`NVIDIA B300 SXM6`); equal to `name` for a type with one model name.
             */
            readonly gpu_class_display: string;
            /**
             * Gpu Variant
             * @description The short label of this model name within its type (`AC`, `PC`); null for a type with one model name.
             */
            readonly gpu_variant: string | null;
            /** K */
            k: number;
            /** Median Price */
            median_price?: number | null;
            /** Name */
            name: string;
            /** P Max */
            p_max: number;
            /** P Min */
            p_min: number;
            /** Price */
            price: number;
            /** Rental Rate */
            rental_rate: number;
            /**
             * Same Card
             * @description True when this model name is the same card as another spelling at the same price (B300 SXM6 AC/PC). Pricing rows and /gpu pages fold only then; the GPU filter still uses gpu_class for the family.
             */
            readonly same_card: boolean;
            /** Soft Price Limit */
            soft_price_limit?: number | null;
            /**
             * Supported
             * @default true
             */
            supported: boolean;
            /** Total Gpu Count */
            total_gpu_count: number;
            /** Usd Per Epoch Rented */
            usd_per_epoch_rented?: number | null;
            /** Usd Per Epoch Unrented */
            usd_per_epoch_unrented?: number | null;
        };
        /** MachineRequestBudgetBandCount */
        MachineRequestBudgetBandCount: {
            /** Band */
            band: string;
            /** Open Requests */
            open_requests: number;
        };
        /** MachineRequestDetailsResponse */
        MachineRequestDetailsResponse: {
            /**
             * Achieved
             * @default false
             */
            achieved: boolean;
            /** Claim Hold Executor Id */
            claim_hold_executor_id?: string | null;
            /** Claim Hold Expires At */
            claim_hold_expires_at?: string | null;
            /** Cpu */
            cpu?: string | null;
            /** Extra Data */
            extra_data?: {
                [key: string]: unknown;
            } | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Linked Executors Count
             * @default 0
             */
            linked_executors_count: number;
            /** Location */
            location?: string | null;
            /** Machine Name */
            machine_name: string;
            /** Provider Hotkey */
            provider_hotkey?: string | null;
            /** Provider Notified At */
            provider_notified_at?: string | null;
            /** Provider Notified Count */
            provider_notified_count?: number | null;
            /** Ram */
            ram?: string | null;
            /** Storage */
            storage?: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * MachineRequestDto
         * @example {
         *       "cpu": "",
         *       "extra_data": {},
         *       "gpu_count": 8,
         *       "location": "USA",
         *       "machine_name": "NVIDIA H200",
         *       "ram": "32gb",
         *       "storage": "1T"
         *     }
         */
        MachineRequestDto: {
            /** Cpu */
            cpu?: string | null;
            /** Extra Data */
            extra_data?: {
                [key: string]: unknown;
            } | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /** Location */
            location?: string | null;
            /** Machine Name */
            machine_name: string;
            /** Provider Hotkey */
            provider_hotkey?: string | null;
            /** Ram */
            ram?: string | null;
            /** Storage */
            storage?: string | null;
        };
        /**
         * MachineRequestFeedSummary
         * @description The anonymous view of the feed (DAH-2269, owner decision 8 Sep 2026): counts only.
         *
         *     Nothing in here names a request or a requester — no id, no user_id, no free-form field. `by_gpu_class` is
         *     sorted by open_requests desc, then name; `by_hourly_budget_band` follows HOURLY_BUDGET_BANDS with "unknown" last,
         *     bands with zero requests omitted.
         */
        MachineRequestFeedSummary: {
            /** By Gpu Class */
            by_gpu_class: components["schemas"]["MachineRequestGpuClassCount"][];
            /** By Hourly Budget Band */
            by_hourly_budget_band: components["schemas"]["MachineRequestBudgetBandCount"][];
            /** Open Requests */
            open_requests: number;
            /**
             * Tier
             * @default aggregate
             * @constant
             */
            tier: "aggregate";
        };
        /** MachineRequestGpuClassCount */
        MachineRequestGpuClassCount: {
            /** Machine Name */
            machine_name: string;
            /** Open Requests */
            open_requests: number;
        };
        /** MachineSpecs */
        MachineSpecs: {
            /** Available Port Count */
            available_port_count?: number | null;
            /** Available Port Maps */
            available_port_maps?: [
                number,
                number
            ][] | null;
            /** Boot Id */
            boot_id?: string | null;
            /** Container Cap Eff */
            container_cap_eff?: string | null;
            cpu: components["schemas"]["CpuSpec"];
            disk_health?: components["schemas"]["DiskHealthSpec"] | null;
            /** Disk Health Scrape Error */
            disk_health_scrape_error?: string | null;
            docker?: components["schemas"]["DockerSpec"] | null;
            /** Egress Ip */
            egress_ip?: string | null;
            gpu: components["schemas"]["GpuSpec"];
            /** Gpu Activity */
            gpu_activity?: components["schemas"]["GpuActivitySpec"][] | null;
            gpu_metrics?: components["schemas"]["GpuMetrics"] | null;
            /** Gpu Power Cap Capable */
            readonly gpu_power_cap_capable: boolean | null;
            /** Gpu Processes */
            gpu_processes?: {
                [key: string]: unknown;
            }[] | null;
            hard_disk?: components["schemas"]["HardDiskSpec"] | null;
            /** Infiniband Ports */
            infiniband_ports?: components["schemas"]["InfinibandPortSpec"][] | null;
            /** Infiniband Scrape Error */
            infiniband_scrape_error?: string | null;
            interconnect?: components["schemas"]["InterconnectSpec"] | null;
            /** Interconnect Scrape Error */
            interconnect_scrape_error?: string | null;
            /**
             * Is Spot
             * @default false
             */
            is_spot: boolean | null;
            /** Job Batch Id */
            job_batch_id?: string | null;
            /** Kernel */
            kernel?: string | null;
            /** Kernel Gpu Uuids */
            kernel_gpu_uuids?: string[] | null;
            /** Kernel Gpu Uuids Last Seen */
            kernel_gpu_uuids_last_seen?: string[] | null;
            /** Kernel Scrape Error */
            kernel_scrape_error?: string | null;
            md5_checksums?: components["schemas"]["Checksums"] | null;
            /** Ncu Profiling Access */
            ncu_profiling_access?: string | null;
            /** Ncu Profiling Scrape Error */
            ncu_profiling_scrape_error?: string | null;
            network?: components["schemas"]["NetworkSpec"] | null;
            /** Nvidiactl Owner Uid */
            nvidiactl_owner_uid?: number | null;
            /** Os */
            os?: string | null;
            /** Port Mappings */
            port_mappings?: string | null;
            /** Port Range */
            port_range?: string | null;
            /** Power Cap Probe Error */
            power_cap_probe_error?: string | null;
            provider_side_load?: components["schemas"]["ProviderSideLoadSpec"] | null;
            ram: components["schemas"]["MemorySpec"];
            /** Roce Link Measurements */
            roce_link_measurements?: components["schemas"]["RoceLinkMeasurementSpec"][] | null;
            /** Storage Limit Supported */
            storage_limit_supported?: boolean | null;
            /** Sysbox Runtime */
            sysbox_runtime?: boolean | null;
            /** Sysbox Version */
            sysbox_version?: string | null;
            /**
             * Tdx Attestation Passed
             * @default false
             */
            tdx_attestation_passed: boolean | null;
            /** Tdx Host Supported */
            tdx_host_supported?: boolean | null;
            /** Verified Ports */
            verified_ports?: number[] | null;
        };
        /** ManualBackupTriggerRequest */
        ManualBackupTriggerRequest: {
            /** Description */
            description?: string | null;
            /** Name */
            name?: string | null;
        };
        /**
         * MaxRentalTimeResponse
         * @description Maximum rental duration statistics.
         */
        MaxRentalTimeResponse: {
            /**
             * Max Rental Duration Hours
             * @description Maximum rental duration in hours
             */
            max_rental_duration_hours: number;
        };
        /** MemorySpec */
        MemorySpec: {
            /** Available */
            available?: number | null;
            /** Free */
            free: number;
            /** Total */
            total: number;
            /** Used */
            used: number;
            /** Utilization */
            utilization?: number | null;
        };
        /** ModelStats */
        ModelStats: {
            /**
             * From Price
             * @description Lowest USD per GPU-hour among nodes available now.
             */
            from_price?: number | null;
            /** Gpu Model */
            gpu_model: string;
            /** Gpus Listed */
            gpus_listed: number;
            /** Gpus Rented */
            gpus_rented: number;
            /**
             * Median Price 30D
             * @description GPU-hour-weighted median paid USD per GPU-hour, 30 days; null on a thin sample.
             */
            median_price_30d?: number | null;
            /**
             * Utilisation 30D
             * @description null below one GPU-month on offer.
             */
            utilisation_30d?: number | null;
        };
        /** NetworkSpec */
        NetworkSpec: {
            /** Download Speed */
            download_speed?: number | null;
            /** Ema Download Speed */
            ema_download_speed?: number | null;
            /** Ema Upload Speed */
            ema_upload_speed?: number | null;
            /** Ema Verifyx Download Speed */
            ema_verifyx_download_speed?: number | null;
            /** Ema Verifyx Upload Speed */
            ema_verifyx_upload_speed?: number | null;
            /** Upload Speed */
            upload_speed?: number | null;
            /** Verifyx Download Speed */
            verifyx_download_speed?: number | null;
            /** Verifyx Upload Speed */
            verifyx_upload_speed?: number | null;
        };
        /**
         * Node
         * @description One rentable node as an aggregator sees it. No fleet internals belong in this model.
         */
        Node: {
            /** Available Gpu Count */
            available_gpu_count?: number | null;
            /**
             * Available Now
             * @description True when the node can be rented now. Rows added by include_rented=true are false.
             * @default true
             */
            available_now: boolean;
            /** City */
            city?: string | null;
            /** Country */
            country?: string | null;
            /** Country Code */
            country_code?: string | null;
            /**
             * Cpu Count
             * @description Whole-host total; a rental of fewer than gpu_count GPUs gets a proportional share.
             */
            cpu_count?: number | null;
            /**
             * Cpu Model
             * @description CPU model string as the host reports it, at most 128 characters.
             */
            cpu_model?: string | null;
            /**
             * Cuda Driver
             * @description Highest CUDA version the installed driver supports, major.minor, e.g. 12.8; null until reported.
             */
            cuda_driver?: string | null;
            /**
             * Disk Free Gb
             * @description Free disk on the whole host at the last scrape, GB; null until reported.
             */
            disk_free_gb?: number | null;
            /**
             * Disk Gb
             * @description Whole-host total; a rental of fewer than gpu_count GPUs gets a proportional share.
             */
            disk_gb?: number | null;
            /**
             * Disk Type
             * @description nvme, ssd, hdd, or unknown when our validator looked and could not tell (a virtual or stacked device). null until our validator has reported it.
             */
            disk_type?: string | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /**
             * Gpu Driver
             * @description NVIDIA driver build as the host reports it, e.g. 570.133.20; at most 32 characters.
             */
            gpu_driver?: string | null;
            /**
             * Gpu Interconnect
             * @description nvlink when every GPU pair on the node is joined by NVLink, confirmed by the validator's P2P and link-state readings; pcie when at least one pair is not on NVLink or a reading contradicts it; null on a single-GPU node, until the topology has been scraped, or when a confirming reading is missing.
             */
            gpu_interconnect?: string | null;
            /** Gpu Memory Gb */
            gpu_memory_gb?: number | null;
            /** Gpu Model */
            gpu_model?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Last Verified At
             * @description When our validator last passed this node, UTC. It re-checks a listed node about every 15 minutes; null when no passed check is on record.
             */
            last_verified_at?: string | null;
            /** Min Rentable Gpu Count */
            min_rentable_gpu_count?: number | null;
            /**
             * Network Download Mbps
             * @description Measured download speed in Mbps, 1 decimal; null until measured.
             */
            network_download_mbps?: number | null;
            /**
             * Network Upload Mbps
             * @description Measured upload speed in Mbps, 1 decimal; null until measured.
             */
            network_upload_mbps?: number | null;
            /** Price Per Gpu Hour */
            price_per_gpu_hour?: number | null;
            /** Price Per Node Hour */
            readonly price_per_node_hour: number | null;
            /**
             * Ram Gb
             * @description Whole-host total; a rental of fewer than gpu_count GPUs gets a proportional share.
             */
            ram_gb?: number | null;
            /** Region */
            region?: string | null;
            /**
             * Region Name
             * @description Name of the subdivision `region` is the code of.
             */
            region_name?: string | null;
            /**
             * Reliability Score
             * @description Provider reliability over a rolling 14-day window of rentals other than voluntary spot, 0-100, one decimal, recomputed every 12 hours; the same for every node of one provider. Counts penalized rentals and rentals that failed to start because of the provider's node. A failed start does not count when it failed on the renter's own image (building, pulling or running it, or the registry login); when the renter deleted the pod before it started; when it failed on Lium's side before the request reached the node; or when it was a reboot of a pod that had started. null = neither a billed rental nor a counted failed start in the window, so no score.
             */
            reliability_score?: number | null;
            /** Rent Url */
            rent_url: string;
            /** Tier */
            tier?: string | null;
            /**
             * Timezone
             * @description IANA time zone of the node's city, e.g. Asia/Tokyo.
             */
            timezone?: string | null;
            /**
             * Uptime Minutes
             * @description Minutes our validator has seen this node online, 15 per validation cycle since it was first listed. Cumulative online time, not the current streak.
             */
            uptime_minutes?: number | null;
        };
        /**
         * NodeOutage
         * @description Recorded outage history for the node hosting this pod.
         */
        NodeOutage: {
            /**
             * Last Recovery Minutes
             * @description The length in minutes of the latest of those outages whose start is recorded; null when none is.
             */
            last_recovery_minutes?: number | null;
            /**
             * Median Recovery Minutes
             * @description The median length in minutes of those outages whose start is recorded; null when none is.
             */
            median_recovery_minutes?: number | null;
            /**
             * Offline Since
             * @description When the current outage started (the node stopped answering the health check or was marked inactive). Null when no start is recorded.
             */
            offline_since?: string | null;
            /**
             * Recoveries
             * @description How many times the node came back from an outage in the last 30 days.
             */
            recoveries: number;
        };
        /**
         * NodesResponse
         * @description The feed envelope. `generated_at` is what lets a consumer detect that we went stale.
         */
        NodesResponse: {
            /** Count */
            readonly count: number;
            /**
             * Generated At
             * Format: date-time
             */
            generated_at: string;
            /** Nodes */
            nodes: components["schemas"]["Node"][];
        };
        /** NoInterruptWindowRequest */
        NoInterruptWindowRequest: {
            /**
             * No Interrupt Until
             * @description ISO timestamp; null clears the window
             */
            no_interrupt_until: string | null;
        };
        /** NoticePeriodResponse */
        NoticePeriodResponse: {
            /**
             * Executor Id
             * Format: uuid
             */
            executor_id: string;
            /**
             * Expiring At
             * Format: date-time
             */
            expiring_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Opt Finished
             * @default false
             */
            opt_finished: boolean;
            /** Period In Minute */
            period_in_minute: number;
            /**
             * Permanent Removal
             * @default false
             */
            permanent_removal: boolean;
            /** Reason */
            reason?: string | null;
            /**
             * Starting At
             * Format: date-time
             */
            starting_at: string;
        };
        /** NotificationCatalogEvent */
        NotificationCatalogEvent: {
            /** Category */
            category: string;
            /** Channels */
            channels: components["schemas"]["NotificationChannel"][];
            /** Description */
            description: string;
            event: components["schemas"]["NotificationType"];
            /** Label */
            label: string;
            severity: components["schemas"]["NotificationSeverity"];
        };
        /** NotificationCatalogResponse */
        NotificationCatalogResponse: {
            /** Events */
            events: components["schemas"]["NotificationCatalogEvent"][];
        };
        /**
         * NotificationChannel
         * @enum {string}
         */
        NotificationChannel: "discord" | "webhook" | "email";
        /** NotificationSetting */
        NotificationSetting: {
            /** Low Balance */
            low_balance?: boolean | null;
            /**
             * Payment Receipt
             * @default false
             */
            payment_receipt: boolean;
            /**
             * Pod Deployed
             * @default false
             */
            pod_deployed: boolean;
            /**
             * Pod Unavailable
             * @default false
             */
            pod_unavailable: boolean;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** NotificationSettingUpdateDto */
        NotificationSettingUpdateDto: {
            /** Low Balance */
            low_balance: boolean;
            /** Payment Receipt */
            payment_receipt: boolean;
            /** Pod Deployed */
            pod_deployed: boolean;
            /** Pod Unavailable */
            pod_unavailable: boolean;
        };
        /**
         * NotificationSeverity
         * @enum {string}
         */
        NotificationSeverity: "info" | "warning" | "critical";
        /**
         * NotificationType
         * @enum {string}
         */
        NotificationType: "node.offline" | "node.validation_failed" | "node.inactive" | "node.unverified" | "node.listed" | "rental.interrupted" | "penalty.applied" | "payout.sent";
        /** OAuth2LoginURLRequest */
        OAuth2LoginURLRequest: {
            /** Redirect Uri */
            redirect_uri: string;
        };
        /** OAuthHandlerRequest */
        OAuthHandlerRequest: {
            /** Code */
            code: string;
            /** Custom Referral Code */
            custom_referral_code?: string | null;
            /** Device Traits */
            device_traits?: string | null;
            /** Partner Ref */
            partner_ref?: string | null;
            /** Referral Code */
            referral_code?: string | null;
            signup_attribution?: components["schemas"]["SignupAttributionDto"] | null;
            /** State */
            state?: string | null;
        };
        /** OAuthLoginResponseDto */
        OAuthLoginResponseDto: {
            /** Is New User */
            is_new_user: boolean;
            /** Signup Credit Granted */
            signup_credit_granted: boolean;
            /** Success */
            success: boolean;
            /** Token */
            token: string;
            user: components["schemas"]["UserResponseDto"];
        };
        /** PaginatedResponse[BackupLogEnhancedResponse] */
        PaginatedResponse_BackupLogEnhancedResponse_: {
            /** Has Next */
            has_next: boolean;
            /** Has Prev */
            has_prev: boolean;
            /** Items */
            items: components["schemas"]["BackupLogEnhancedResponse"][];
            /** Limit */
            limit: number;
            /** Page */
            page: number;
            /** Total Count */
            total_count: number;
            /** Total Pages */
            total_pages: number;
        };
        /** PaginatedResponse[BackupLogResponse] */
        PaginatedResponse_BackupLogResponse_: {
            /** Has Next */
            has_next: boolean;
            /** Has Prev */
            has_prev: boolean;
            /** Items */
            items: components["schemas"]["BackupLogResponse"][];
            /** Limit */
            limit: number;
            /** Page */
            page: number;
            /** Total Count */
            total_count: number;
            /** Total Pages */
            total_pages: number;
        };
        /** PaginatedResponse[RestoreLogResponse] */
        PaginatedResponse_RestoreLogResponse_: {
            /** Has Next */
            has_next: boolean;
            /** Has Prev */
            has_prev: boolean;
            /** Items */
            items: components["schemas"]["RestoreLogResponse"][];
            /** Limit */
            limit: number;
            /** Page */
            page: number;
            /** Total Count */
            total_count: number;
            /** Total Pages */
            total_pages: number;
        };
        /**
         * PayoutMethod
         * @enum {string}
         */
        PayoutMethod: "STRIPE" | "CRYPTO" | "BALANCE";
        /**
         * PayoutResponse
         * @description Response model for a payout.
         */
        PayoutResponse: {
            /** Amount */
            amount: number;
            /** Completed At */
            completed_at?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Currency */
            currency: string;
            /** Destination Address */
            destination_address?: string | null;
            /** Error Message */
            error_message?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Meta Data */
            meta_data?: {
                [key: string]: unknown;
            } | null;
            /** Microservice Transaction Id */
            microservice_transaction_id?: string | null;
            /** Network */
            network?: string | null;
            payout_method: components["schemas"]["PayoutMethod"];
            payout_type: components["schemas"]["PayoutType"];
            status: components["schemas"]["PayoutStatus"];
            /** Stripe Transfer Id */
            stripe_transfer_id?: string | null;
            /** Token Type */
            token_type?: string | null;
            /** Transaction Hash */
            transaction_hash?: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
            /** Wallet Id */
            wallet_id?: string | null;
        };
        /**
         * PayoutStatus
         * @enum {string}
         */
        PayoutStatus: "PENDING" | "CONFIRMED" | "FAILED";
        /**
         * PayoutType
         * @enum {string}
         */
        PayoutType: "REFERRAL" | "BALANCE_WITHDRAWAL";
        /** Pod */
        Pod: {
            /** Build Context Key */
            build_context_key?: string | null;
            /** Cluster Id */
            cluster_id?: string | null;
            /** Cluster Node Index */
            cluster_node_index?: number | null;
            /** Cluster Ssh Authorized Key */
            cluster_ssh_authorized_key?: string | null;
            /** Cluster Ssh Private Key */
            cluster_ssh_private_key?: string | null;
            /** Cluster Wireguard Conf */
            cluster_wireguard_conf?: string | null;
            /**
             * Container Name
             * @default
             */
            container_name: string;
            /**
             * Cpu Count
             * @default 0
             */
            cpu_count: number;
            /**
             * Cpu Name
             * @default
             */
            cpu_name: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Created By Api Key Id */
            created_by_api_key_id?: string | null;
            /** Created By User Id */
            created_by_user_id?: string | null;
            /** Discord Channel Id */
            discord_channel_id?: string | null;
            /** Dockerfile Content */
            dockerfile_content?: string | null;
            /**
             * Enable Jupyter
             * @default false
             */
            enable_jupyter: boolean | null;
            /** Enable Volume Encryption */
            enable_volume_encryption?: boolean | null;
            /**
             * Executor Id
             * Format: uuid
             */
            executor_id: string;
            /**
             * Gpu Count
             * @default
             */
            gpu_count: string;
            /**
             * Gpu Name
             * @default
             */
            gpu_name: string;
            /**
             * Id
             * Format: uuid
             */
            id?: string;
            /** Is Favorite */
            is_favorite?: boolean | null;
            /**
             * Is Manual Rental
             * @default false
             */
            is_manual_rental: boolean | null;
            /** Jupyter Installation Started At */
            jupyter_installation_started_at?: string | null;
            jupyter_installation_status?: components["schemas"]["JupyterInstallationStatus"] | null;
            /** Jupyter Url */
            jupyter_url?: string | null;
            /** Local Volume Path */
            local_volume_path?: string | null;
            /** No Interrupt Until */
            no_interrupt_until?: string | null;
            /** Pending Price */
            pending_price?: number | null;
            /**
             * Pod Name
             * @default
             */
            pod_name: string;
            /**
             * Ports Mapping
             * @default {}
             */
            ports_mapping: {
                [key: string]: unknown;
            } | string;
            /** Price */
            price?: number | null;
            /** Price Change Effective At */
            price_change_effective_at?: string | null;
            /** Price Change Notice Attempted At */
            price_change_notice_attempted_at?: string | null;
            /** Price Change Notified At */
            price_change_notified_at?: string | null;
            /**
             * Ram Total
             * @default 0
             */
            ram_total: number;
            /** Removal Scheduled At */
            removal_scheduled_at?: string | null;
            /** Retries */
            retries: number | null;
            /**
             * Skip Add Agent Ssh Key
             * @default false
             */
            skip_add_agent_ssh_key: boolean | null;
            /**
             * Ssh Connect Cmd
             * @default
             */
            ssh_connect_cmd: string;
            status?: components["schemas"]["PodStatus"] | null;
            /** Storage Limit Gb */
            storage_limit_gb?: number | null;
            /** Template Id */
            template_id: string | null;
            /** Termination Hours */
            termination_hours?: number | null;
            /** Updated At */
            updated_at?: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
            /** User Public Key */
            user_public_key?: string | null;
            volume_encryption_status?: components["schemas"]["VolumeEncryptionStatus"] | null;
            /** Volume Id */
            volume_id: string | null;
            /** Volume Limit Gb */
            volume_limit_gb?: number | null;
            /**
             * Volume Name
             * @default
             */
            volume_name: string;
            /** Workspace Id */
            workspace_id?: string | null;
        };
        /** PodDetailResponse */
        PodDetailResponse: {
            /** Api Key Name */
            api_key_name?: string | null;
            /**
             * Billed Until
             * @description UTC time up to which spend_to_date is settled: the ledger's last accrual tick for this rental. null until the first charge is booked (a pod in its first minutes, or one that never became billable).
             */
            billed_until?: string | null;
            /**
             * Billing Paused
             * @description A billed pod on a node marked inactive or read as down by the validator: each 5-minute charge is $0 until the node is back (see Billing, When a pod is charged).
             * @default false
             */
            billing_paused: boolean;
            /** Cluster Id */
            cluster_id?: string | null;
            /** Cluster Node Index */
            cluster_node_index?: number | null;
            /**
             * Cluster Overlay Ip
             * @description This node's address on the cluster's private overlay — where its peers reach it.
             */
            readonly cluster_overlay_ip: string | null;
            /** Cpu Count */
            cpu_count: number;
            /** Cpu Name */
            cpu_name: string;
            /** @description While the pod is PENDING or REBOOT_PENDING: `stage` (the step the create has reached, same text as `phase`), `message` (the validator's latest create log line, null before the first) and `updated_at` (ISO-8601 UTC, when the backend got that line or entered the stage). Null otherwise. */
            create_progress?: components["schemas"]["CreateProgress"] | null;
            /** Created At */
            created_at?: string | null;
            /** Created By Api Key Id */
            created_by_api_key_id?: string | null;
            /** Enable Jupyter */
            enable_jupyter: boolean | null;
            /** Enable Volume Encryption */
            enable_volume_encryption: boolean | null;
            /**
             * Estimated Ready Seconds
             * @description Seconds left of the time-to-ready estimate made when the rent was accepted; 0 once it has run over. Only while the pod is PENDING or REBOOT_PENDING.
             */
            estimated_ready_seconds?: number | null;
            /**
             * Eta Basis
             * @description What the estimate was made from: this node's recent creates (executor_history), its GPU class (class_median) or the fleet default (fleet_default); cold_pull_estimate when an image pull the node does not have cached was added on top.
             */
            eta_basis?: ("executor_history" | "class_median" | "cold_pull_estimate" | "fleet_default") | null;
            executor: components["schemas"]["ExecutorForPodResponse"];
            /**
             * Executor Id
             * Format: uuid
             */
            executor_id: string;
            /** Gpu Count */
            gpu_count: string;
            /** Gpu Name */
            gpu_name: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Favorite */
            is_favorite: boolean | null;
            /** Is Manual Rental */
            is_manual_rental?: boolean | null;
            jupyter_installation_status: components["schemas"]["JupyterInstallationStatus"] | null;
            /** Jupyter Url */
            jupyter_url: string | null;
            last_event?: components["schemas"]["PodEventResponse"] | null;
            /** Local Volume Path */
            local_volume_path?: string | null;
            /**
             * No Interrupt Until
             * @description UTC time before which the provider may not start a planned maintenance or removal notice on this pod's node. null when the renter set none.
             */
            no_interrupt_until?: string | null;
            /**
             * Node Offline
             * @description The node failed its health checks (not responding) or is marked inactive. The pod keeps its status; it may not be reachable until the node is back.
             * @default false
             */
            node_offline: boolean;
            /** @description Set while `node_offline` is true: since when, and how the node's outages in the last 30 days ended. History only, not a prediction. Null otherwise. */
            node_outage?: components["schemas"]["NodeOutage"] | null;
            notice_period?: components["schemas"]["NoticePeriodResponse"] | null;
            /**
             * Pending Price
             * @description Hourly USD price this pod moves to at price_change_effective_at: the node's listed price is now above what this pod pays. null when no change is pending.
             */
            pending_price?: number | null;
            /**
             * Phase
             * @description The step the create has reached, read from the validator's log lines.
             */
            phase?: ("queued" | "preparing node" | "connecting to node" | "pulling image" | "creating volume" | "starting container" | "mounting encrypted volume" | "configuring ssh") | null;
            /** Pod Name */
            pod_name: string;
            pod_status?: components["schemas"]["PodStatusResponse"] | null;
            /** Ports Mapping */
            ports_mapping: {
                [key: string]: unknown;
            } | string;
            /** Price */
            price?: number | null;
            /**
             * Price Change Effective At
             * @description UTC time the pending price takes effect. Null when no change is pending or while its notification e-mail is held. Notices are limited to one per pod per 24 hours.
             */
            price_change_effective_at?: string | null;
            /**
             * Price Change Notice Hours
             * @description Hours a pending raise waits after the renter is e-mailed about it before it reaches the pod (24 on a Spot node).
             */
            price_change_notice_hours?: number;
            /** Provider Discord Connected */
            provider_discord_connected?: boolean | null;
            /** Ram Total */
            ram_total: number;
            /** Removal Scheduled At */
            removal_scheduled_at: string | null;
            /** Rental Tier */
            rental_tier?: string | null;
            /** Skip Add Agent Ssh Key */
            skip_add_agent_ssh_key?: boolean | null;
            /**
             * Spend To Date
             * @description USD billed to this rental so far, summed from the billing ledger, not price × elapsed time. The ledger accrues every 5 minutes and settles on deletion, so this lags real time by at most one accrual interval; 0.0 until the first charge is booked.
             * @default 0
             */
            spend_to_date: number;
            /** Ssh Connect Cmd */
            ssh_connect_cmd: string;
            /** Ssh Keys */
            ssh_keys?: components["schemas"]["SshKeyForPodResponse"][] | null;
            /**
             * Starting Ssh Connect Cmd
             * @description The SSH command the pod will answer on, set while it is PENDING or REBOOT_PENDING once its SSH port is known, before the API reports the pod RUNNING. Null while the port is not known yet, and in every other status (use `ssh_connect_cmd` there). Older servers do not send this field.
             */
            starting_ssh_connect_cmd?: string | null;
            /** Status */
            status: string;
            template?: components["schemas"]["TemplateBaseResponse"] | null;
            /** Termination Hours */
            termination_hours: number | null;
            /** Updated At */
            updated_at?: string | null;
            volume?: components["schemas"]["VolumeForPodResponse"] | null;
            volume_encryption_status: components["schemas"]["VolumeEncryptionStatus"] | null;
            /**
             * Volume Limit Gb
             * @description Size in GB of the pod's local /root volume. null on a pod created without a storage limit.
             */
            volume_limit_gb?: number | null;
            /** Workspace Id */
            workspace_id?: string | null;
        };
        /** PodDiscordChannelRequest */
        PodDiscordChannelRequest: {
            /** Content */
            content?: string | null;
        };
        /** PodDiscordChannelResponse */
        PodDiscordChannelResponse: {
            /** Channel Id */
            channel_id: string;
            /** Channel Url */
            channel_url?: string | null;
            /** Discord Channel Id */
            discord_channel_id: string;
            /** Message */
            message: string;
        };
        /**
         * PodEventResponse
         * @description One entry of a pod's event log, flattened from the stored Event row (DAH-2927).
         *
         *     ``reason``/``detail``/``from_status``/``to_status`` are set on pod-lifecycle events; ``error``
         *     on the failure events (create, reboot, delete) that carry an ErrorMetadata. ``actor`` (DAH-2934)
         *     says which session or API key made the request; null on events the platform wrote by itself.
         */
        PodEventResponse: {
            actor?: components["schemas"]["ActorMetadata"] | null;
            /** Created At */
            created_at: string | null;
            /** Detail */
            detail?: string | null;
            /** Error */
            error?: string | null;
            /** Event Type */
            event_type: string | null;
            /** From Status */
            from_status?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Pod Id */
            pod_id?: string | null;
            /** Pod Name */
            pod_name?: string | null;
            /** Reason */
            reason?: string | null;
            /** Sub Event Type */
            sub_event_type?: string | null;
            /** To Status */
            to_status?: string | null;
        };
        /** PodGpuResetOutcome */
        PodGpuResetOutcome: {
            /** Detail */
            detail?: string | null;
            /** Index */
            index: number;
            /**
             * Result
             * @enum {string}
             */
            result: "reset" | "latch_cleared" | "failed";
            /** Uuid */
            uuid: string;
        };
        /** PodLaunchSnapshot */
        PodLaunchSnapshot: {
            /**
             * Cuda Driver
             * @description Highest CUDA version that driver supports, major.minor.
             */
            cuda_driver: string | null;
            /**
             * Gpu Driver
             * @description NVIDIA driver build on the node, e.g. 570.133.20.
             */
            gpu_driver: string | null;
            /**
             * Gpu Interconnect
             * @description nvlink when every GPU pair on the node is joined by NVLink, pcie when one is not; null on a single-GPU node or before the topology was scraped.
             */
            gpu_interconnect: string | null;
            /**
             * Image
             * @description Image reference as dispatched: `repo:tag`, or `repo@sha256:…` when the template pins a digest.
             */
            image: string | null;
            /**
             * Recorded At
             * Format: date-time
             * @description When the container came up and these were recorded.
             */
            recorded_at: string;
            /**
             * Template Id
             * @description Template the container was started from; null for a Dockerfile.
             */
            template_id: string | null;
        };
        /** PodListItemResponse */
        PodListItemResponse: {
            /** Api Key Name */
            api_key_name?: string | null;
            /**
             * Billed Until
             * @description UTC time up to which spend_to_date is settled: the ledger's last accrual tick for this rental. null until the first charge is booked (a pod in its first minutes, or one that never became billable).
             */
            billed_until?: string | null;
            /**
             * Billing Paused
             * @description A billed pod on a node marked inactive or read as down by the validator: each 5-minute charge is $0 until the node is back (see Billing, When a pod is charged).
             * @default false
             */
            billing_paused: boolean;
            /** Cluster Id */
            cluster_id?: string | null;
            /** Cluster Node Index */
            cluster_node_index?: number | null;
            /**
             * Cluster Overlay Ip
             * @description This node's address on the cluster's private overlay — where its peers reach it.
             */
            readonly cluster_overlay_ip: string | null;
            /** Cpu Count */
            cpu_count: number;
            /** Cpu Name */
            cpu_name: string;
            /** @description While the pod is PENDING or REBOOT_PENDING: `stage` (the step the create has reached, same text as `phase`), `message` (the validator's latest create log line, null before the first) and `updated_at` (ISO-8601 UTC, when the backend got that line or entered the stage). Null otherwise. */
            create_progress?: components["schemas"]["CreateProgress"] | null;
            /** Created At */
            created_at: string | null;
            /** Created By Api Key Id */
            created_by_api_key_id?: string | null;
            /** Enable Jupyter */
            enable_jupyter: boolean | null;
            /** Enable Volume Encryption */
            enable_volume_encryption: boolean | null;
            /**
             * Estimated Ready Seconds
             * @description Seconds left of the time-to-ready estimate made when the rent was accepted; 0 once it has run over. Only while the pod is PENDING or REBOOT_PENDING.
             */
            estimated_ready_seconds?: number | null;
            /**
             * Eta Basis
             * @description What the estimate was made from: this node's recent creates (executor_history), its GPU class (class_median) or the fleet default (fleet_default); cold_pull_estimate when an image pull the node does not have cached was added on top.
             */
            eta_basis?: ("executor_history" | "class_median" | "cold_pull_estimate" | "fleet_default") | null;
            executor: components["schemas"]["ExecutorForPodResponse"];
            /**
             * Executor Id
             * Format: uuid
             */
            executor_id: string;
            /** Gpu Count */
            gpu_count: string;
            /** Gpu Name */
            gpu_name: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Favorite */
            is_favorite: boolean | null;
            /** Is Manual Rental */
            is_manual_rental?: boolean | null;
            jupyter_installation_status: components["schemas"]["JupyterInstallationStatus"] | null;
            /** Jupyter Url */
            jupyter_url: string | null;
            /** Local Volume Path */
            local_volume_path?: string | null;
            /**
             * No Interrupt Until
             * @description UTC time before which the provider may not start a planned maintenance or removal notice on this pod's node. null when the renter set none.
             */
            no_interrupt_until?: string | null;
            /**
             * Node Offline
             * @description The node failed its health checks (not responding) or is marked inactive. The pod keeps its status; it may not be reachable until the node is back.
             * @default false
             */
            node_offline: boolean;
            /** @description Set while `node_offline` is true: since when, and how the node's outages in the last 30 days ended. History only, not a prediction. Null otherwise. */
            node_outage?: components["schemas"]["NodeOutage"] | null;
            notice_period?: components["schemas"]["NoticePeriodResponse"] | null;
            /**
             * Pending Price
             * @description Hourly USD price this pod moves to at price_change_effective_at: the node's listed price is now above what this pod pays. null when no change is pending.
             */
            pending_price?: number | null;
            /**
             * Phase
             * @description The step the create has reached, read from the validator's log lines.
             */
            phase?: ("queued" | "preparing node" | "connecting to node" | "pulling image" | "creating volume" | "starting container" | "mounting encrypted volume" | "configuring ssh") | null;
            /** Pod Name */
            pod_name: string;
            /** Ports Mapping */
            ports_mapping: {
                [key: string]: unknown;
            } | string;
            /** Price */
            price?: number | null;
            /**
             * Price Change Effective At
             * @description UTC time the pending price takes effect. Null when no change is pending or while its notification e-mail is held. Notices are limited to one per pod per 24 hours.
             */
            price_change_effective_at?: string | null;
            /**
             * Price Change Notice Hours
             * @description Hours a pending raise waits after the renter is e-mailed about it before it reaches the pod (24 on a Spot node).
             */
            price_change_notice_hours?: number;
            /** Ram Total */
            ram_total: number;
            /** Removal Scheduled At */
            removal_scheduled_at: string | null;
            /** Rental Tier */
            rental_tier?: string | null;
            /** Skip Add Agent Ssh Key */
            skip_add_agent_ssh_key?: boolean | null;
            /**
             * Spend To Date
             * @description USD billed to this rental so far, summed from the billing ledger, not price × elapsed time. The ledger accrues every 5 minutes and settles on deletion, so this lags real time by at most one accrual interval; 0.0 until the first charge is booked.
             * @default 0
             */
            spend_to_date: number;
            /** Ssh Connect Cmd */
            ssh_connect_cmd: string;
            /** Ssh Keys */
            ssh_keys?: components["schemas"]["SshKeyForPodResponse"][] | null;
            /**
             * Starting Ssh Connect Cmd
             * @description The SSH command the pod will answer on, set while it is PENDING or REBOOT_PENDING once its SSH port is known, before the API reports the pod RUNNING. Null while the port is not known yet, and in every other status (use `ssh_connect_cmd` there). Older servers do not send this field.
             */
            starting_ssh_connect_cmd?: string | null;
            /** Status */
            status: string;
            template?: components["schemas"]["TemplateBaseResponse"] | null;
            /** Termination Hours */
            termination_hours: number | null;
            /** Updated At */
            updated_at: string | null;
            volume?: components["schemas"]["VolumeForPodResponse"] | null;
            volume_encryption_status: components["schemas"]["VolumeEncryptionStatus"] | null;
            /**
             * Volume Limit Gb
             * @description Size in GB of the pod's local /root volume. null on a pod created without a storage limit.
             */
            volume_limit_gb?: number | null;
            /** Workspace Id */
            workspace_id?: string | null;
        };
        /**
         * PodRunRecord
         * @description What one run ran on, what it cost and when, readable after the pod is removed.
         */
        PodRunRecord: {
            /** Billed Seconds */
            billed_seconds: number;
            /** Close Reason */
            close_reason: string | null;
            /** Created At */
            created_at: string | null;
            /**
             * Executor Id
             * @description The node (executor.id) the pod ran on last.
             */
            executor_id: string | null;
            /** Gpu Count */
            gpu_count: number | null;
            /** Gpu Name */
            gpu_name: string | null;
            /**
             * Image
             * @description `launch_snapshot.image`; for a run older than the launch snapshot, the image on the rental.
             */
            image: string | null;
            /** @description Null for a run whose container came up before the snapshot was recorded, or never came up. */
            launch_snapshot: components["schemas"]["PodLaunchSnapshot"] | null;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Pod Name */
            pod_name: string | null;
            /** Price Segments */
            price_segments: components["schemas"]["PodStatementPriceSegment"][];
            /** Removed */
            removed: boolean;
            /** Removed At */
            removed_at: string | null;
            /**
             * Total
             * @description USD charged, the same total GET /pods/{id}/statement returns.
             */
            total: number;
        };
        /**
         * PodStatement
         * @description Everything one pod cost, from the ledger alone, so it reads the same before and after removal.
         */
        PodStatement: {
            /**
             * Api Key Id
             * @description The API key that created the pod, from the ledger; null for a browser rental.
             */
            api_key_id?: string | null;
            /**
             * Api Key Name
             * @description That key's current name; null once the key is deleted.
             */
            api_key_name?: string | null;
            /**
             * Billed Seconds
             * @description Sum of the days' billed_seconds.
             */
            billed_seconds: number;
            /**
             * Billed Until
             * @description Latest settled interval end across the days.
             */
            billed_until: string | null;
            /**
             * Close Reason
             * @description Why the rental ended (user_initiated, scheduled_termination, …).
             */
            close_reason: string | null;
            /**
             * Created At
             * @description Rental start; NULL when no rental record survives.
             */
            created_at: string | null;
            /**
             * Days
             * @description One entry per ledger row, oldest first; a UTC day can have more than one row (for example when billing stops and resumes).
             */
            days: components["schemas"]["PodStatementDay"][];
            /**
             * Executor Id
             * @description The node (executor.id) the pod ran on.
             */
            executor_id: string | null;
            /** Gpu Count */
            gpu_count: number | null;
            /** Gpu Name */
            gpu_name: string | null;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /**
             * Pod Name
             * @description Name at the last accrual; NULL when nothing recorded it.
             */
            pod_name: string | null;
            /**
             * Price Segments
             * @description Seconds and USD per distinct $/h. One entry unless the price changed mid-rental.
             */
            price_segments: components["schemas"]["PodStatementPriceSegment"][];
            /**
             * Removed
             * @description True when the pod row no longer exists.
             */
            removed: boolean;
            /**
             * Removed At
             * @description Rental end; NULL while the pod exists.
             */
            removed_at: string | null;
            /**
             * Total
             * @description Sum of the days' amounts, exactly what the ledger charged.
             */
            total: number;
        };
        /**
         * PodStatementDay
         * @description One ledger row: what one pod was charged for part or all of one UTC day. A day can have more than one row.
         */
        PodStatementDay: {
            /**
             * Amount
             * @description USD this row charged for its part of the day, after any refund or penalty.
             */
            amount: number;
            /**
             * Billed Seconds
             * @description Seconds this row charged for. NULL only on rows older than the ledger kept it.
             */
            billed_seconds: number | null;
            /**
             * Billed Until
             * Format: date-time
             * @description End of the last settled interval. On the last day of a removed pod this is the removal time: the final settlement on removal lands in that row.
             */
            billed_until: string;
            /**
             * Billing Day
             * @description UTC day, YYYY-MM-DD.
             */
            billing_day: string;
            /**
             * Price Per Hour
             * @description USD per hour the seconds were charged at.
             */
            price_per_hour: number | null;
        };
        /** PodStatementPriceSegment */
        PodStatementPriceSegment: {
            /** Amount */
            amount: number;
            /** Billed Seconds */
            billed_seconds: number;
            /** Price Per Hour */
            price_per_hour: number;
        };
        /**
         * PodStatus
         * @enum {string}
         */
        PodStatus: "PENDING" | "RUNNING" | "STOPPED" | "FAILED" | "DELETING" | "STOP_PENDING" | "START_PENDING" | "CREATION_FAILED" | "BROKEN" | "REBOOT_PENDING" | "REBOOT_FAILED";
        /** PodStatusResponse */
        PodStatusResponse: {
            /** Hardware Utilization */
            hardware_utilization: {
                [key: string]: unknown;
            } | null;
            /** Logs */
            logs: {
                [key: string]: unknown;
            }[] | null;
        };
        /** PodUpdateRequest */
        PodUpdateRequest: {
            /** Pod Name */
            pod_name?: string | null;
        };
        /**
         * PotentialTransferRequest
         * @description POST /transfer/potential's body: the dashboard announces the transfer it is about to sign, before sending it.
         *     ``stripe_customer_id`` may be omitted; if sent it must be the caller's.
         */
        PotentialTransferRequest: {
            /** Amount Tao */
            amount_tao: number;
            /** Amount Usd */
            amount_usd: number;
            /** From Wallet */
            from_wallet: string;
            /** Rate */
            rate: number;
            /** Stripe Customer Id */
            stripe_customer_id?: string | null;
            /** To Wallet */
            to_wallet: string;
        };
        /** PriceChangeAlternative */
        PriceChangeAlternative: {
            /** City */
            city?: string | null;
            /** Country Code */
            country_code?: string | null;
            /**
             * Executor Id
             * Format: uuid
             */
            executor_id: string;
            /** Gpu Count */
            gpu_count: number;
            /** Hourly Price */
            hourly_price: number;
            /** Machine Name */
            machine_name: string;
            /** Price Per Gpu */
            price_per_gpu: number;
            /** Reliability Score */
            reliability_score?: number | null;
            /** Tier */
            tier?: string | null;
        };
        /**
         * PriceChangeAlternatives
         * @description `GET /pods/{id}/price-change-alternatives`: the pod's pending raise and where the same GPUs cost no more.
         */
        PriceChangeAlternatives: {
            /**
             * Alternatives
             * @default []
             */
            alternatives: components["schemas"]["PriceChangeAlternative"][];
            /** Current Price */
            current_price?: number | null;
            /** Pending Price */
            pending_price?: number | null;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
        };
        /**
         * ProviderHotkeysResponse
         * @description The provider pages a coldkey leads to. Only the hotkeys come back: each already has its own public page, and
         *     the reverse question (which coldkey a hotkey belongs to) stays unanswered, as on the node row.
         */
        ProviderHotkeysResponse: {
            /**
             * Miner Coldkey
             * @description The coldkey that was asked for
             */
            miner_coldkey: string;
            /**
             * Miner Hotkeys
             * @description Hotkeys whose nodes report this coldkey, sorted
             */
            miner_hotkeys: string[];
        };
        /** ProviderReferralAttributeRequest */
        ProviderReferralAttributeRequest: {
            /** Code */
            code: string;
        };
        /** ProviderReferralAttributeResponse */
        ProviderReferralAttributeResponse: {
            /**
             * Referral Id
             * Format: uuid
             */
            referral_id: string;
            /** Status */
            status: string;
        };
        /**
         * ProviderReferralFirstLoginResponse
         * @description The portal's login signal (DAH-3311): the first one stamps `first_login_at`, every one answers the anchor.
         */
        ProviderReferralFirstLoginResponse: {
            /**
             * First Login At
             * Format: date-time
             */
            first_login_at: string;
            /**
             * Late Entry Anchor
             * Format: date-time
             */
            late_entry_anchor: string;
            /** Stamped */
            stamped: boolean;
        };
        /** ProviderReferralPayoutRequest */
        ProviderReferralPayoutRequest: {
            /** Destination Address */
            destination_address?: string | null;
            /**
             * Method
             * @enum {string}
             */
            method: "stablecoin" | "credits";
        };
        /** ProviderReferralPayoutResponse */
        ProviderReferralPayoutResponse: {
            /** Amount Usd */
            amount_usd: number;
            /** Method */
            method: string;
            /**
             * Payout Id
             * Format: uuid
             */
            payout_id: string;
            /** Status */
            status: string;
            /** Transaction Id */
            transaction_id: string | null;
        };
        /** ProviderReferralSummaryResponse */
        ProviderReferralSummaryResponse: {
            /** Accrued Usd */
            accrued_usd: number;
            /** Balance Usd */
            balance_usd: number;
            /**
             * Code Entry Deadline
             * Format: date-time
             */
            code_entry_deadline: string;
            /** Duration Months */
            duration_months: number;
            /** Earning Enabled */
            earning_enabled: boolean;
            /** Has Referrer */
            has_referrer: boolean;
            /** Held Usd */
            held_usd: number;
            /** Hold Days */
            hold_days: number;
            /** Min Withdrawal Usd */
            min_withdrawal_usd: number;
            /** Paid Or Pending Usd */
            paid_or_pending_usd: number;
            /** Rate */
            rate: number;
            /** Referral Code */
            referral_code: string;
            /** Referred */
            referred: components["schemas"]["ReferredProviderSummary"][];
            /** Referred Bonus Accrued Usd */
            referred_bonus_accrued_usd: number;
            /** Referred Bonus Rate */
            referred_bonus_rate: number;
            /** Withdrawable Usd */
            withdrawable_usd: number;
            /** Withdrawals Blocked */
            withdrawals_blocked: boolean;
        };
        /**
         * ProviderSideLoadSpec
         * @description DAH-2734: what the machine's OWNER consumes outside Lium's containers.
         *
         *     The validator computes it and sends it with the specs, so the fleet cut is a plain JSON read.
         *     Each part is None when the scrape could not measure it that cycle - never a guess.
         */
        ProviderSideLoadSpec: {
            /** Cpu Cores */
            cpu_cores?: number | null;
            /** Disk Kb */
            disk_kb?: number | null;
        };
        /**
         * ProviderStatisticsResponse
         * @description Comprehensive provider statistics response.
         * @example {
         *       "average_network_speed": {
         *         "average_download_speed_mbps": 520.75,
         *         "average_upload_speed_mbps": 450.25,
         *         "total_machines_with_network_data": 5
         *       },
         *       "feedback_rates": {
         *         "bad_feedbacks": 5,
         *         "good_feedbacks": 45,
         *         "good_percentage": 90,
         *         "total_feedbacks": 50
         *       },
         *       "locations": [
         *         {
         *           "city": "San Francisco",
         *           "country": "United States",
         *           "country_code": "US",
         *           "latitude": 37.7749,
         *           "longitude": -122.4194,
         *           "region": "California",
         *           "timezone": "America/Los_Angeles"
         *         }
         *       ],
         *       "max_rental_time": {
         *         "max_rental_duration_hours": 168.5
         *       },
         *       "miner_hotkey": "5Abc123...",
         *       "rental_failures": {
         *         "rental_failures": 2
         *       },
         *       "rental_successes": {
         *         "rental_successes": 150,
         *         "success_rate_percentage": 98.68
         *       },
         *       "unique_positive_renters": {
         *         "unique_positive_renters": 25
         *       },
         *       "unique_renters": {
         *         "unique_renters": 28
         *       },
         *       "uptime_counts": {
         *         "average_uptime_hours": 720,
         *         "reclaimed_count": 1,
         *         "total_gpus": 40,
         *         "total_machines": 5
         *       }
         *     }
         */
        "ProviderStatisticsResponse-Input": {
            average_network_speed: components["schemas"]["AverageNetworkSpeedResponse"];
            feedback_rates: components["schemas"]["FeedbackRatesResponse"];
            /** @description DAH-3524 (R-84) host-load state of the provider's nodes */
            host_load?: components["schemas"]["HostLoadResponse"];
            /**
             * Locations
             * @description Unique locations of the live nodes
             */
            locations: components["schemas"]["LocationResponse"][];
            max_rental_time: components["schemas"]["MaxRentalTimeResponse"];
            /**
             * Miner Hotkey
             * @description The hotkey of the provider
             */
            miner_hotkey: string;
            rental_failures: components["schemas"]["RentalFailuresResponse"];
            rental_successes: components["schemas"]["RentalSuccessResponse"];
            unique_positive_renters: components["schemas"]["UniquePositiveRentersResponse"];
            unique_renters: components["schemas"]["UniqueRentersResponse"];
            uptime_counts: components["schemas"]["UptimeCountsResponse"];
        };
        /**
         * ProviderStatisticsResponse
         * @description Comprehensive provider statistics response.
         * @example {
         *       "average_network_speed": {
         *         "average_download_speed_mbps": 520.75,
         *         "average_upload_speed_mbps": 450.25,
         *         "total_machines_with_network_data": 5
         *       },
         *       "feedback_rates": {
         *         "bad_feedbacks": 5,
         *         "good_feedbacks": 45,
         *         "good_percentage": 90,
         *         "total_feedbacks": 50
         *       },
         *       "locations": [
         *         {
         *           "city": "San Francisco",
         *           "country": "United States",
         *           "country_code": "US",
         *           "latitude": 37.7749,
         *           "longitude": -122.4194,
         *           "region": "California",
         *           "timezone": "America/Los_Angeles"
         *         }
         *       ],
         *       "max_rental_time": {
         *         "max_rental_duration_hours": 168.5
         *       },
         *       "miner_hotkey": "5Abc123...",
         *       "rental_failures": {
         *         "rental_failures": 2
         *       },
         *       "rental_successes": {
         *         "rental_successes": 150,
         *         "success_rate_percentage": 98.68
         *       },
         *       "unique_positive_renters": {
         *         "unique_positive_renters": 25
         *       },
         *       "unique_renters": {
         *         "unique_renters": 28
         *       },
         *       "uptime_counts": {
         *         "average_uptime_hours": 720,
         *         "reclaimed_count": 1,
         *         "total_gpus": 40,
         *         "total_machines": 5
         *       }
         *     }
         */
        "ProviderStatisticsResponse-Output": {
            average_network_speed: components["schemas"]["AverageNetworkSpeedResponse"];
            feedback_rates: components["schemas"]["FeedbackRatesResponse"];
            /** @description DAH-3524 (R-84) host-load state of the provider's nodes */
            host_load?: components["schemas"]["HostLoadResponse"];
            /**
             * Locations
             * @description Unique locations of the live nodes
             */
            locations: components["schemas"]["LocationResponse"][];
            max_rental_time: components["schemas"]["MaxRentalTimeResponse"];
            /**
             * Miner Hotkey
             * @description The hotkey of the provider
             */
            miner_hotkey: string;
            rental_failures: components["schemas"]["RentalFailuresResponse"];
            rental_successes: components["schemas"]["RentalSuccessResponse"];
            unique_positive_renters: components["schemas"]["UniquePositiveRentersResponse"];
            unique_renters: components["schemas"]["UniqueRentersResponse"];
            uptime_counts: components["schemas"]["UptimeCountsResponse"];
        };
        /** PublicCpuSpec */
        PublicCpuSpec: {
            /** Count */
            count?: number | null;
            /** Model */
            model?: string | null;
        };
        /**
         * PublicDiskHealth
         * @description The two readings of the validator's disk probe that leave the API (models/executor.py
         *     PUBLIC_DISK_HEALTH_FIELDS, DAH-2929); the docker root path and the exception text stay stored.
         */
        PublicDiskHealth: {
            /** Read Only Mounts */
            read_only_mounts?: string[] | null;
            /** Write Probe */
            write_probe?: string | null;
        };
        /** PublicGpuDetail */
        PublicGpuDetail: {
            /** Capacity */
            capacity?: number | null;
            /** Name */
            name?: string | null;
        };
        /** PublicGpuSpec */
        PublicGpuSpec: {
            /** Count */
            count?: number | null;
            /**
             * Details
             * @default []
             */
            details: components["schemas"]["PublicGpuDetail"][];
            /** Driver */
            driver?: string | null;
        };
        /** PublicHardDiskSpec */
        PublicHardDiskSpec: {
            /** Free */
            free?: number | null;
            /** Total */
            total?: number | null;
            /** Utilization */
            utilization?: number | null;
        };
        /** PublicNetworkSpec */
        PublicNetworkSpec: {
            /** Download Speed */
            download_speed?: number | null;
            /** Upload Speed */
            upload_speed?: number | null;
        };
        /** PublicRamSpec */
        PublicRamSpec: {
            /** Total */
            total?: number | null;
        };
        /** PublicStatsResponse */
        PublicStatsResponse: {
            /** Countries */
            countries: components["schemas"]["CountryStats"][];
            fleet: components["schemas"]["FleetStats"];
            /**
             * Generated At
             * Format: date-time
             */
            generated_at: string;
            /** Models */
            models: components["schemas"]["ModelStats"][];
            reliability: components["schemas"]["ReliabilityStats"];
            throughput?: components["schemas"]["ThroughputStats"] | null;
            /**
             * Utilisation Daily
             * @default []
             */
            utilisation_daily: components["schemas"]["DailyUtilisation"][];
        };
        /** RebootPodRequest */
        RebootPodRequest: {
            /** Volume Id */
            volume_id?: string | null;
        };
        /** ReferralCodeResponse */
        ReferralCodeResponse: {
            /** Referral Code */
            referral_code: string;
            /** Referral Link */
            referral_link?: string | null;
        };
        /** ReferralHistoryItem */
        ReferralHistoryItem: {
            /** Completed At */
            completed_at: string | null;
            /** Created At */
            created_at: string | null;
            /** Referred Email */
            referred_email: string | null;
            /** Referred Name */
            referred_name: string;
            /** Reward Paid */
            reward_paid: number;
            /** Status */
            status: string;
            /** Tiers */
            tiers: components["schemas"]["ReferralTierInfo"][];
        };
        /** ReferralHistoryResponse */
        ReferralHistoryResponse: {
            /** History */
            history: components["schemas"]["ReferralHistoryItem"][];
            /** Referral Code */
            referral_code: string;
        };
        /**
         * ReferralPayoutMethod
         * @enum {string}
         */
        ReferralPayoutMethod: "balance" | "usd" | "crypto";
        /** ReferralPayoutMethodUpdateDto */
        ReferralPayoutMethodUpdateDto: {
            referral_payout_method: components["schemas"]["ReferralPayoutMethod"];
            /** Wallet Id */
            wallet_id?: string | null;
        };
        /** ReferralProgramInfoResponse */
        ReferralProgramInfoResponse: {
            /** Description */
            description?: string | null;
            /** Payment Threshold */
            payment_threshold: number;
            /** Referred Bonus */
            referred_bonus: number;
            /** Referrer Reward */
            referrer_reward: number;
            /** Tiers */
            tiers?: {
                [key: string]: unknown;
            }[] | null;
        };
        /** ReferralStatsResponse */
        ReferralStatsResponse: {
            /**
             * Cash Out Available Now
             * @default 0
             */
            cash_out_available_now: number;
            /** Commission All Released At */
            commission_all_released_at?: string | null;
            /**
             * Commission Hold Days
             * @default 0
             */
            commission_hold_days: number;
            /** Commission Next Release At */
            commission_next_release_at?: string | null;
            /**
             * Commission Next Release Usd
             * @default 0
             */
            commission_next_release_usd: number;
            /**
             * Commission On Hold
             * @default 0
             */
            commission_on_hold: number;
            /** Completed Referrals */
            completed_referrals: number;
            /** Pending Referral Balance */
            pending_referral_balance: number;
            /** Pending Referrals */
            pending_referrals: number;
            /** Referral Code */
            referral_code: string;
            /** Total Earned */
            total_earned: number;
            /** Total Referrals */
            total_referrals: number;
        };
        /** ReferralTierInfo */
        ReferralTierInfo: {
            /** End Date */
            end_date: string | null;
            /** Is Active */
            is_active: boolean;
            /** Rate */
            rate: number;
            /**
             * Start Date
             * Format: date-time
             */
            start_date: string;
        };
        /** ReferredProviderSummary */
        ReferredProviderSummary: {
            /** Accrued Usd */
            accrued_usd: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Gpus Judged */
            gpus_judged: number;
            /** Gpus Qualified */
            gpus_qualified: number;
            /** Provider */
            provider: string;
            /**
             * Referral Id
             * Format: uuid
             */
            referral_id: string;
            /** Status */
            status: string;
            /** Status Reason */
            status_reason?: string | null;
        };
        /** ReliabilityStats */
        ReliabilityStats: {
            /** Median Score */
            median_score?: number | null;
            /**
             * Scored Nodes
             * @description Listed nodes (rented or not) whose provider has a 14-day reliability score.
             */
            scored_nodes: number;
            /**
             * Share At Least 95
             * @description Share of scored nodes at 95 or above, 0-1.
             */
            share_at_least_95?: number | null;
        };
        /**
         * RentalFailuresResponse
         * @description Rental failure statistics.
         */
        RentalFailuresResponse: {
            /**
             * Rental Failures
             * @description All-time number of pods that failed to start
             */
            rental_failures: number;
        };
        /**
         * RentalSuccessResponse
         * @description Rental success statistics.
         */
        RentalSuccessResponse: {
            /**
             * Rental Successes
             * @description All-time number of successful rentals
             */
            rental_successes: number;
            /**
             * Success Rate Percentage
             * @description All-time successes / (successes + failures) in percent; null with no rental attempt
             */
            success_rate_percentage?: number | null;
        };
        /**
         * RentBySpecAlternative
         * @description A node that also satisfied the spec, in the order it would be tried.
         */
        RentBySpecAlternative: {
            /** Available Gpu Count */
            available_gpu_count?: number | null;
            /** Country Code */
            country_code?: string | null;
            /** Download Mbps */
            download_mbps?: number | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /** Id */
            id: string;
            /** Machine Name */
            machine_name?: string | null;
            /** Price Per Gpu */
            price_per_gpu?: number | null;
            /** Price Per Hour */
            price_per_hour: number;
        };
        /** RentBySpecNoMatchResponse */
        RentBySpecNoMatchResponse: {
            /** Candidates Before */
            candidates_before: number;
            /**
             * Code
             * @default no_executor_matches_spec
             */
            code: string;
            /** Constraint */
            constraint: string;
            /** Message */
            message: string;
            /**
             * Success
             * @default false
             */
            success: boolean;
        };
        /**
         * RentBySpecRequest
         * @description Rent the cheapest node that satisfies a spec instead of naming one (POST /executors/rent-by-spec, DAH-3046).
         *
         *     Everything a single rental takes, minus the node: the server picks it from the node catalogue.
         *     `gpu_count` is the number of GPUs to rent (default 1); a node qualifies with that many free
         *     GPUs if it is the whole node or a split its provider allows. `min_vram_gb`, `min_download_mbps`
         *     and `min_ports` are floors on the host; `min_cpus`, `min_ram_gb` and `min_disk_gb` are floors on
         *     what the POD gets — a split rental's proportional share of the host's CPUs, RAM (less 2 GiB) and
         *     disk. A host that does not report a figure does not qualify. `max_price_per_gpu_hour` is checked
         *     on the catalogue and again on the live node right before the rent. `template_id` may be omitted:
         *     the recommended image for the selected node's GPU and driver is used. `ncu_profiling` keeps only
         *     nodes with open GPU profiling counters; those rent whole, so `gpu_count` must be the host's.
         * @example {
         *       "dry_run": true,
         *       "gpu_count": 1,
         *       "gpu_type": "H100",
         *       "max_price_per_gpu_hour": 2,
         *       "min_download_mbps": 500,
         *       "pod_name": "train-1",
         *       "user_public_key": [
         *         "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMo32AY0vFK7g5FBIBcyPdxaxSEM5rEc0kEzMVveA9b+"
         *       ]
         *     }
         */
        RentBySpecRequest: {
            /** Backup Log Id */
            backup_log_id?: string | null;
            /** Build Context Sha256 */
            build_context_sha256?: string | null;
            /** Country */
            country?: string | null;
            /** Docker In Docker */
            docker_in_docker?: boolean | null;
            /** Dockerfile Content */
            dockerfile_content?: string | null;
            /**
             * Dry Run
             * @default false
             */
            dry_run: boolean;
            /**
             * Enable Backups
             * @default true
             */
            enable_backups: boolean;
            /** Enable Jupyter */
            enable_jupyter?: boolean | null;
            /**
             * Enable Volume Encryption
             * @default true
             */
            enable_volume_encryption: boolean | null;
            /**
             * Gpu Count
             * @default 1
             */
            gpu_count: number;
            /** Gpu Type */
            gpu_type: string;
            /** Initial Port Count */
            initial_port_count?: number | null;
            /** Max Price Per Gpu Hour */
            max_price_per_gpu_hour?: number | null;
            /** Min Cpus */
            min_cpus?: number | null;
            /** Min Disk Gb */
            min_disk_gb?: number | null;
            /** Min Download Mbps */
            min_download_mbps?: number | null;
            /** Min Ports */
            min_ports?: number | null;
            /** Min Ram Gb */
            min_ram_gb?: number | null;
            /** Min Vram Gb */
            min_vram_gb?: number | null;
            /**
             * Ncu Profiling
             * @default false
             */
            ncu_profiling: boolean;
            /** Pod Name */
            pod_name: string;
            /** Restore Path */
            restore_path?: string | null;
            /** Skip Add Agent Ssh Key */
            skip_add_agent_ssh_key?: boolean | null;
            /** Template Id */
            template_id?: string | null;
            /** Termination Hours */
            termination_hours?: number | null;
            /** User Public Key */
            user_public_key: string | string[];
            /** Volume Id */
            volume_id?: string | null;
        };
        /** RentBySpecResponse */
        RentBySpecResponse: {
            /** Alternatives Considered */
            alternatives_considered: components["schemas"]["RentBySpecAlternative"][];
            /** Attempts */
            attempts: number;
            /** Candidates */
            candidates: number;
            /** Dry Run */
            dry_run: boolean;
            /** Pod Id */
            pod_id?: string | null;
            /** Price Per Hour */
            price_per_hour: number;
            /** Selected Executor */
            selected_executor: {
                [key: string]: unknown;
            };
            /**
             * Success
             * @default true
             */
            success: boolean;
            /** Template Id */
            template_id?: string | null;
        };
        /**
         * RentClusterRequest
         * @description Rent several nodes of one InfiniBand fabric as a single all-or-nothing order (DAH-2620).
         *
         *     Everything a single rental takes, plus the nodes. The same payload is applied to every node, so
         *     a cluster is homogeneous by construction — which is what a distributed job needs anyway.
         *     `template_id` may be omitted: our cluster template is used.
         * @example {
         *       "backup_log_id": "123e4567-e89b-12d3-a456-426614174000",
         *       "enable_jupyter": false,
         *       "initial_port_count": 10,
         *       "pod_name": "123e4567-e89b-12d3-a456-426614174000",
         *       "restore_path": "/home/user/data",
         *       "skip_add_agent_ssh_key": false,
         *       "template_id": "b21be992-dde1-4aa1-a42f-6787c7af9846",
         *       "termination_hours": 24,
         *       "user_public_key": [
         *         "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMo32AY0vFK7g5FBIBcyPdxaxSEM5rEc0kEzMVveA9b+",
         *         "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMo32AY0vFK7g5FBIBcyPdxaxSEM5rEc0kEzMVveA9eb+"
         *       ],
         *       "volume_id": "123e4567-e89b-12d3-a456-426614174000"
         *     }
         */
        RentClusterRequest: {
            /** Backup Log Id */
            backup_log_id?: string | null;
            /** Build Context Sha256 */
            build_context_sha256?: string | null;
            /** Dockerfile Content */
            dockerfile_content?: string | null;
            /**
             * Enable Backups
             * @default true
             */
            enable_backups: boolean;
            /** Enable Jupyter */
            enable_jupyter?: boolean | null;
            /**
             * Enable Volume Encryption
             * @default true
             */
            enable_volume_encryption: boolean | null;
            /** Executor Uuids */
            executor_uuids: string[];
            /** Gpu Count */
            gpu_count?: number | null;
            /** Initial Port Count */
            initial_port_count?: number | null;
            /**
             * Ncu Profiling
             * @default false
             */
            ncu_profiling: boolean;
            /** Pod Name */
            pod_name: string;
            /** Restore Path */
            restore_path?: string | null;
            /** Skip Add Agent Ssh Key */
            skip_add_agent_ssh_key?: boolean | null;
            /** Template Id */
            template_id?: string | null;
            /** Termination Hours */
            termination_hours?: number | null;
            /** User Public Key */
            user_public_key: string | string[];
            /** Volume Id */
            volume_id?: string | null;
        };
        /**
         * RentExecutorRequest
         * @description Request to rent a node.
         *
         *     Attributes:
         *         termination_hours: Number of hours after which the pod should be automatically terminated.
         *             Must be between 1 and 720 hours (30 days).
         *         initial_port_count: Number of ports to initially allocate for this pod.
         *             Must be non-negative and not exceed node's available ports.
         *         dockerfile_content: DAH-2211. Optional user-supplied Dockerfile text. When set,
         *             the validator builds an image from this content on the executor host before
         *             running the container. XOR with `template_id` — exactly one must be set.
         *             Size is capped at `config.CUSTOM_DOCKERFILE_POD["max_dockerfile_bytes"]`
         *             (default 65_536 bytes).
         * @example {
         *       "backup_log_id": "123e4567-e89b-12d3-a456-426614174000",
         *       "enable_jupyter": false,
         *       "initial_port_count": 10,
         *       "pod_name": "123e4567-e89b-12d3-a456-426614174000",
         *       "restore_path": "/home/user/data",
         *       "skip_add_agent_ssh_key": false,
         *       "template_id": "b21be992-dde1-4aa1-a42f-6787c7af9846",
         *       "termination_hours": 24,
         *       "user_public_key": [
         *         "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMo32AY0vFK7g5FBIBcyPdxaxSEM5rEc0kEzMVveA9b+",
         *         "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMo32AY0vFK7g5FBIBcyPdxaxSEM5rEc0kEzMVveA9eb+"
         *       ],
         *       "volume_id": "123e4567-e89b-12d3-a456-426614174000"
         *     }
         */
        RentExecutorRequest: {
            /** Backup Log Id */
            backup_log_id?: string | null;
            /** Build Context Sha256 */
            build_context_sha256?: string | null;
            /** Dockerfile Content */
            dockerfile_content?: string | null;
            /**
             * Enable Backups
             * @default true
             */
            enable_backups: boolean;
            /** Enable Jupyter */
            enable_jupyter?: boolean | null;
            /**
             * Enable Volume Encryption
             * @default true
             */
            enable_volume_encryption: boolean | null;
            /** Gpu Count */
            gpu_count?: number | null;
            /** Initial Port Count */
            initial_port_count?: number | null;
            /**
             * Ncu Profiling
             * @default false
             */
            ncu_profiling: boolean;
            /** Pod Name */
            pod_name: string;
            /** Restore Path */
            restore_path?: string | null;
            /** Skip Add Agent Ssh Key */
            skip_add_agent_ssh_key?: boolean | null;
            /** Template Id */
            template_id?: string | null;
            /** Termination Hours */
            termination_hours?: number | null;
            /** User Public Key */
            user_public_key: string | string[];
            /** Volume Id */
            volume_id?: string | null;
        };
        /** ReportUnknownDriverRequest */
        ReportUnknownDriverRequest: {
            /**
             * Driver Version
             * @description NVIDIA driver version the validator could not recognize, e.g. 595.84
             */
            driver_version: string;
        };
        /** RequestedClass */
        RequestedClass: {
            /**
             * Class
             * @description The GPU class key (utils/gpu_class.py), e.g. B300.
             */
            class: string;
            /**
             * Gpus Asked
             * @description GPUs those requests add up to; a request without a count adds none.
             */
            gpus_asked: number;
            /**
             * Oldest At
             * Format: date-time
             * @description When the oldest open request for the class was filed.
             */
            oldest_at: string;
            /**
             * Requests
             * @description Open requests for the class.
             */
            requests: number;
        };
        /** RequestResetPasswordDto */
        RequestResetPasswordDto: {
            /**
             * Email
             * @default test@test.com
             */
            email: string;
            /**
             * Password Reset Base Url
             * @deprecated
             * @description Ignored.
             */
            password_reset_base_url?: string | null;
        };
        /** RequestsFeedResponse */
        RequestsFeedResponse: {
            /** Classes */
            classes: string[];
            /**
             * Generated At
             * Format: date-time
             */
            generated_at: string;
            /** Requests */
            requests: components["schemas"]["RequestedClass"][];
        };
        /** ResellerReportResponse */
        ResellerReportResponse: {
            /**
             * Group By
             * @enum {string}
             */
            group_by: "day" | "gpu" | "customer_ref";
            /** Rows */
            rows: components["schemas"]["ResellerReportRow"][];
            /**
             * Since
             * Format: date
             * @description First UTC day of the window, inclusive.
             */
            since: string;
            /**
             * Until
             * Format: date
             * @description Last UTC day of the window, inclusive.
             */
            until: string;
        };
        /** ResellerReportRow */
        ResellerReportRow: {
            /**
             * Bucket
             * @description The group: a UTC day (YYYY-MM-DD), a GPU model (`volume` for storage charges), or a customer_ref (`untagged` for rentals without one).
             */
            bucket: string;
            /**
             * Fault Closes
             * @description Rentals closed by a provider or platform fault (executor offline, broken by provider, rent failed, undeploy failed).
             */
            fault_closes: number;
            /**
             * Gpu Hours
             * @description Sum of rental hours × GPU count; a rental still running is counted to now.
             */
            gpu_hours: number;
            /**
             * Rentals
             * @description Rentals opened in the window and this bucket, failed starts included.
             */
            rentals: number;
            /**
             * Usd Billed
             * @description Sum of the account's billing rows (billing_day in the window) in this bucket.
             */
            usd_billed: number;
        };
        /** ResendVerifyEmailRequest */
        ResendVerifyEmailRequest: {
            /** Email */
            email: string;
        };
        /** ResetPasswordDto */
        ResetPasswordDto: {
            /** Password */
            password: string;
            /** Reset Password Token */
            reset_password_token: string;
        };
        /** ResetPodGpuRequest */
        ResetPodGpuRequest: {
            /** Gpu Indices */
            gpu_indices?: number[] | null;
        };
        /**
         * ResetPodGpuResponse
         * @description POST answers `running`; GET polls by request_id until `done`, `failed` or `timeout`.
         */
        ResetPodGpuResponse: {
            /** Container Restarted */
            container_restarted?: boolean | null;
            error?: components["schemas"]["GpuResetError"] | null;
            /**
             * Gpus
             * @default []
             */
            gpus: components["schemas"]["PodGpuResetOutcome"][];
            /** Ok */
            ok?: boolean | null;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Request Id */
            request_id: string;
            /**
             * Status
             * @enum {string}
             */
            status: "running" | "done" | "failed" | "timeout";
        };
        /** RestoreLogResponse */
        RestoreLogResponse: {
            /** Backup Engine */
            backup_engine: string;
            /**
             * Backup Id
             * Format: uuid
             */
            backup_id: string;
            /** Completed At */
            completed_at?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Elapsed Seconds */
            elapsed_seconds?: number | null;
            /** Error Message */
            error_message?: string | null;
            /** Estimated Remaining Seconds */
            estimated_remaining_seconds?: number | null;
            /**
             * Failed At
             * @description When the restore was marked FAILED (UTC).
             */
            failed_at?: string | null;
            /**
             * Failure Reason
             * @description Why a FAILED restore failed, as `<code>: <detail>`. Codes: `heartbeat_timeout` (the node stopped reporting; says how long before the failure its last report was), `executor_error` (the node reported the failure; its message, error code or exit code), `dispatch_failed` (the restore could not be handed to the node). Null on non-failed restores, on restores failed before this field existed, and on the legacy engine.
             */
            failure_reason?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Heartbeat At */
            last_heartbeat_at?: string | null;
            /** Logs */
            logs?: string[] | null;
            /**
             * Pod Id
             * Format: uuid
             */
            pod_id: string;
            /** Processed Bytes */
            processed_bytes?: number | null;
            /** Processed Files */
            processed_files?: number | null;
            /** Progress */
            progress: number;
            /** Restore Mode */
            restore_mode: string;
            /** Restore Path */
            restore_path?: string | null;
            /** Stage */
            stage?: string | null;
            /** Started At */
            started_at?: string | null;
            /** Status */
            status: string;
            /** Throughput Bytes Per Second */
            throughput_bytes_per_second?: number | null;
            /** Total Bytes */
            total_bytes?: number | null;
            /** Total Files */
            total_files?: number | null;
        };
        /** RestoreProgressUpdateRequest */
        RestoreProgressUpdateRequest: {
            /** Error Code */
            error_code?: ("RESTIC_REPOSITORY_MISSING" | "RESTIC_SNAPSHOT_MISSING") | null;
            /** Error Message */
            error_message?: string | null;
            /** Exit Code */
            exit_code?: number | null;
            /** Logs */
            logs?: string[] | null;
            /** Operation Id */
            operation_id?: string | null;
            /** Processed Bytes */
            processed_bytes?: number | null;
            /** Processed Files */
            processed_files?: number | null;
            /** Progress */
            progress: number;
            /** Result Quality */
            result_quality?: string | null;
            /** Snapshot Id */
            snapshot_id?: string | null;
            /** Stage */
            stage?: string | null;
            /** Status */
            status: string;
            /** Total Bytes */
            total_bytes?: number | null;
            /** Total Files */
            total_files?: number | null;
        };
        /** RestoreRequest */
        RestoreRequest: {
            /**
             * Backup Id
             * Format: uuid
             */
            backup_id: string;
            /** Restore Path */
            restore_path: string;
        };
        /**
         * RoceLinkMeasurementSpec
         * @description What the validator measured between this host and ONE neighbour on its segment (DAH-2667).
         *
         *     A RoCE fabric is otherwise only inferred from addresses, and a shared segment is not proof that
         *     the switch carries RDMA. The validator runs `ib_write_bw` between the free hosts of a segment
         *     and writes one of these per pair into the specs of BOTH hosts, each naming the other.
         *
         *     `gigabits_per_second` is None when that pair could not talk — a recorded failure, not silence.
         */
        RoceLinkMeasurementSpec: {
            /** Gigabits Per Second */
            gigabits_per_second?: number | null;
            /** Measured At */
            measured_at: string;
            /** Peer Address */
            peer_address: string;
            /** Peer Executor Uuid */
            peer_executor_uuid: string;
        };
        /**
         * ScheduledNoticeResponse
         * @description A provider's open maintenance or removal notice on a listed node, shown before the renter rents it.
         *
         *     When `expiring_at` passes, `handle_notice_period` reboots a pod on the node (maintenance) or deletes it
         *     (`permanent_removal`), so a rental taken now is interrupted then. The provider's free-text reason is left out.
         */
        ScheduledNoticeResponse: {
            /**
             * Expiring At
             * Format: date-time
             */
            expiring_at: string;
            /**
             * Permanent Removal
             * @default false
             */
            permanent_removal: boolean;
            /**
             * Starting At
             * Format: date-time
             */
            starting_at: string;
        };
        /** ScheduleRemovalRequest */
        ScheduleRemovalRequest: {
            /** Removal Scheduled At */
            removal_scheduled_at: string;
        };
        /** SharedConfig */
        SharedConfig: {
            /** Bittensor Netuid */
            bittensor_netuid: number;
            /** Collateral Contract Address */
            collateral_contract_address: string;
            /** Collateral Days */
            collateral_days: number;
            /**
             * Default Docker Images
             * @default [
             *       {
             *         "image": "daturaai/pytorch",
             *         "tag": "2.12.0-py3.12-cuda12.8-devel-ubuntu24.04-dind",
             *         "pytorch": 2.12,
             *         "python": 3.12,
             *         "cuda": 12.8,
             *         "ubuntu": 24.04,
             *         "size": 12022823632
             *       },
             *       {
             *         "image": "daturaai/pytorch",
             *         "tag": "2.12.0-py3.12-cuda13.0.2-devel-ubuntu24.04-dind",
             *         "pytorch": 2.12,
             *         "python": 3.12,
             *         "cuda": 13,
             *         "ubuntu": 24.04,
             *         "size": 12022823632
             *       }
             *     ]
             */
            default_docker_images: {
                [key: string]: unknown;
            }[];
            /** Driver Cuda Map */
            driver_cuda_map: {
                [key: string]: number;
            };
            /** Gpu Architectures */
            gpu_architectures: {
                [key: string]: {
                    [key: string]: unknown;
                };
            };
            /** Machine Max Price Rate */
            machine_max_price_rate: number;
            /** Machine Min Price Rate */
            machine_min_price_rate: number;
            /** Machine Prices */
            machine_prices: {
                [key: string]: number;
            };
            /** Machine Prices P90 */
            machine_prices_p90?: {
                [key: string]: number;
            };
            /** Max Initial Port Count */
            max_initial_port_count: number;
            /**
             * Multinode Clusters Enabled
             * @default false
             */
            multinode_clusters_enabled: boolean;
            /** Nvml Invalid Drivers */
            nvml_invalid_drivers?: string[];
            /** Nvml Ml Digests */
            nvml_ml_digests?: {
                [key: string]: string;
            };
            /**
             * Payout Delay Days
             * @default 2
             */
            payout_delay_days: number;
            /**
             * Payout Processing Hour Utc
             * @default 17
             */
            payout_processing_hour_utc: number;
            /** Rental Fees Rate */
            rental_fees_rate: number;
            /**
             * Require Storage Limit Supported
             * @default false
             */
            require_storage_limit_supported: boolean;
            /** Required Deposit Amount */
            required_deposit_amount: {
                [key: string]: number;
            };
            /**
             * Soft Limit Price Rate
             * @default 1.1
             */
            soft_limit_price_rate: number;
            /** Total Burn Emission */
            total_burn_emission: number;
            /** Volume Gb Hour Price Usd */
            volume_gb_hour_price_usd: number;
        };
        /**
         * SignupAttributionDto
         * @description Bounded campaign data accepted only during account creation.
         *
         *     Either the three UTMs or `referrer_host` (the external site a visitor came from, host only) must be present.
         */
        SignupAttributionDto: {
            /** Gclid */
            gclid?: string | null;
            /** Landing Path */
            landing_path: string;
            /** Rdt Cid */
            rdt_cid?: string | null;
            /** Referrer Host */
            referrer_host?: string | null;
            /** Twclid */
            twclid?: string | null;
            /** Utm Campaign */
            utm_campaign?: string | null;
            /** Utm Content */
            utm_content?: string | null;
            /** Utm Id */
            utm_id?: string | null;
            /** Utm Medium */
            utm_medium?: string | null;
            /** Utm Source */
            utm_source?: string | null;
            /** Utm Term */
            utm_term?: string | null;
        };
        /** SignupResponseDto */
        SignupResponseDto: {
            /** Api Key */
            api_key?: string | null;
            /** Is New User */
            is_new_user: boolean;
            /** Msg */
            msg: string;
            /**
             * Signup Credit Granted
             * @default false
             */
            signup_credit_granted: boolean;
        };
        /**
         * SpotIdleRate
         * @description Spot idle pay per GPU-hour, subject to change.
         */
        SpotIdleRate: {
            /** Gpu Count */
            gpu_count: number;
            /** Gpu Model */
            gpu_model: string;
            /** Spot Usd Per Gpu Hour */
            spot_usd_per_gpu_hour: number;
        };
        /** SshKey */
        SshKey: {
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /**
             * Id
             * Format: uuid
             */
            id?: string;
            /**
             * Is For Admin
             * @default false
             */
            is_for_admin: boolean | null;
            /** Name */
            name: string;
            /** Public Key */
            public_key: string;
            /** Updated At */
            updated_at?: string | null;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** SshKeyForPodResponse */
        SshKeyForPodResponse: {
            /** Name */
            name: string;
            /** Public Key */
            public_key: string;
        };
        /** StripeInvoiceResponse */
        StripeInvoiceResponse: {
            /** Amount Paid */
            amount_paid: number;
            /** Amount Paid Usd */
            amount_paid_usd: number;
            /** Created */
            created: number;
            /** Currency */
            currency: string;
            /** Hosted Invoice Url */
            hosted_invoice_url?: string | null;
            /** Invoice Id */
            invoice_id: string;
            /** Invoice Pdf */
            invoice_pdf?: string | null;
            /** Payment Intent Id */
            payment_intent_id?: string | null;
            /** Status */
            status: string;
        };
        /** SwitchTemplatePodRequest */
        SwitchTemplatePodRequest: {
            /**
             * Template Id
             * Format: uuid
             */
            template_id: string;
        };
        /** TemplateBaseResponse */
        TemplateBaseResponse: {
            category: components["schemas"]["TemplateCategory"];
            /** Description */
            description: string | null;
            /** Docker Image */
            docker_image: string;
            /** Docker Image Digest */
            docker_image_digest: string | null;
            /** Docker Image Tag */
            docker_image_tag: string;
            /** Entrypoint */
            entrypoint: string | null;
            /** Environment */
            environment: {
                [key: string]: string;
            } | null;
            /** Id */
            id: string | null;
            /** Internal Ports */
            internal_ports: number[] | null;
            /** Is Private */
            is_private: boolean;
            /** Name */
            name: string;
            /** Startup Commands */
            startup_commands: string | null;
            /** Volumes */
            volumes: string[] | null;
        };
        /**
         * TemplateCategory
         * @enum {string}
         */
        TemplateCategory: "DOCKER" | "PYTORCH" | "NVIDIA" | "TENSOR_FLOW" | "OPEN_AI" | "UBUNTU";
        /** TemplateCheckIssue */
        TemplateCheckIssue: {
            /** Code */
            code: string;
            /** Field */
            field: string;
            /** Message */
            message: string;
        };
        /**
         * TemplateCheckRequest
         * @description The fields of a template form that decide whether its pod can start, checked before the save.
         */
        TemplateCheckRequest: {
            /** Docker Credential Id */
            docker_credential_id?: string | null;
            /**
             * Docker Image
             * @default
             */
            docker_image: string;
            /**
             * Docker Image Digest
             * @default
             */
            docker_image_digest: string;
            /** Docker Image Tag */
            docker_image_tag?: string | null;
            /**
             * Entrypoint
             * @default
             */
            entrypoint: string;
            /**
             * Startup Commands
             * @default
             */
            startup_commands: string;
        };
        /** TemplateCompatibilityInfo */
        TemplateCompatibilityInfo: {
            /** Driver Max Cuda Supported */
            driver_max_cuda_supported: number | null;
            /** Gpu Min Cuda Required */
            gpu_min_cuda_required: number | null;
            /** Is Compatible */
            is_compatible: boolean | null;
            /** Reason */
            reason: string | null;
            /** Template Cuda Version */
            template_cuda_version: number | null;
        };
        /** TemplateResponse */
        TemplateResponse: {
            category: components["schemas"]["TemplateCategory"];
            compatibility?: components["schemas"]["TemplateCompatibilityInfo"] | null;
            /** Container Start Immediately */
            container_start_immediately: boolean | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string | null;
            /** Docker Credential Id */
            docker_credential_id: string | null;
            /** Docker Image */
            docker_image: string;
            /** Docker Image Digest */
            docker_image_digest: string | null;
            /** Docker Image Size */
            docker_image_size: number | null;
            /** Docker Image Tag */
            docker_image_tag: string;
            /** Download Count */
            download_count: number | null;
            /** Entrypoint */
            entrypoint: string | null;
            /** Environment */
            environment: {
                [key: string]: string;
            } | null;
            /** Health Check Command */
            health_check_command: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Internal Ports */
            internal_ports: number[] | null;
            /** Is Created From Official Template */
            is_created_from_official_template: boolean | null;
            /** Is Private */
            is_private: boolean | null;
            /** Is Temporary */
            is_temporary: boolean | null;
            /** Name */
            name: string;
            /** One Time Template */
            one_time_template: boolean | null;
            /** Readme */
            readme: string | null;
            /** Startup Commands */
            startup_commands: string | null;
            /** Startup Warning */
            startup_warning?: string | null;
            /** Status */
            status: string | null;
            /** Supports Docker */
            supports_docker?: boolean | null;
            /**
             * Supports Volume Encryption
             * @default false
             */
            supports_volume_encryption: boolean;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** User Id */
            user_id: string | null;
            /** Validator Only */
            validator_only: boolean | null;
            /** Verification Logs */
            verification_logs: string | null;
            /** Verified At */
            verified_at?: string | null;
            /** Verified Executor Id */
            verified_executor_id?: string | null;
            /** Verified Gpu Model */
            verified_gpu_model?: string | null;
            /** Verified Image Digest */
            verified_image_digest?: string | null;
            /** Verify Ssh Connection */
            verify_ssh_connection: boolean | null;
            /** Volumes */
            volumes: string[] | null;
        };
        /** ThroughputStats */
        ThroughputStats: {
            /** Daily */
            daily: components["schemas"]["DailyThroughput"][];
            /**
             * Days
             * @description Complete UTC days the totals cover, ending yesterday.
             */
            days: number;
            /** Gmv Usd */
            gmv_usd: number;
            /** Gpu Hours */
            gpu_hours: number;
            /** Rentals */
            rentals: number;
        };
        /** TmcPayCreateInvoiceRequest */
        TmcPayCreateInvoiceRequest: {
            /** Amount */
            amount: number;
            /** Crypto Currency */
            crypto_currency: string;
            /** Crypto Network */
            crypto_network: string;
        };
        /** TmcPayCreateInvoiceResponse */
        TmcPayCreateInvoiceResponse: {
            /** Crypto Amount */
            crypto_amount: number;
            /** Crypto Currency */
            crypto_currency: string;
            /** Crypto Network */
            crypto_network: string;
            /** Deposit Address */
            deposit_address: string;
            /** Exchange Rate */
            exchange_rate: number;
            /** Expires At */
            expires_at: string;
            /** External Id */
            external_id: string;
            /** Fiat Amount */
            fiat_amount: number;
            /** Fiat Currency */
            fiat_currency: string;
            /** Hosted Invoice Url */
            hosted_invoice_url: string;
            /** Invoice Id */
            invoice_id: string;
            /** Transaction Id */
            transaction_id: string;
        };
        /** TmcPayCurrenciesResponse */
        TmcPayCurrenciesResponse: {
            /** Currencies */
            currencies: components["schemas"]["TmcPayCurrency"][];
        };
        /** TmcPayCurrency */
        TmcPayCurrency: {
            /** Code */
            code: string;
            /** Decimals */
            decimals: number;
            /** Display Decimals */
            display_decimals: number;
            /** Network */
            network: string;
        };
        /** TmcPayInvoicesResponse */
        TmcPayInvoicesResponse: {
            /** Invoices */
            invoices: components["schemas"]["TmcPayInvoiceStatusItem"][];
        };
        /**
         * TmcPayInvoiceStatusItem
         * @description DAH-3309: one row of the Billing page's pending-deposits card.
         */
        TmcPayInvoiceStatusItem: {
            /** Confirmations */
            confirmations: number | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Credited Amount In Usd */
            credited_amount_in_usd: number | null;
            /** Crypto Currency */
            crypto_currency: string;
            /** Crypto Network */
            crypto_network: string;
            /** Expires At */
            expires_at: string | null;
            /** Failure Reason */
            failure_reason: string | null;
            /** Fiat Amount */
            fiat_amount: number;
            /** Hosted Invoice Url */
            hosted_invoice_url: string | null;
            /** Invoice Id */
            invoice_id: string | null;
            /** Payment Hold Until */
            payment_hold_until: string | null;
            /** Pending Crypto Amount */
            pending_crypto_amount: number | null;
            /** Provider Status */
            provider_status: string;
            /** Received Fiat Amount */
            received_fiat_amount: number | null;
            /** Remaining Fiat Amount */
            remaining_fiat_amount: number | null;
            /** Required Confirmations */
            required_confirmations: number | null;
            /** Status */
            status: string;
            /** Transaction Id */
            transaction_id: string;
        };
        /** ToppedUpCard */
        ToppedUpCard: {
            /** Brand */
            brand?: string | null;
            /** Last4 */
            last4?: string | null;
        };
        /** TotalCountExecutorResponse */
        TotalCountExecutorResponse: {
            /** Total Count */
            total_count: number;
        };
        /**
         * TransactionPlatform
         * @enum {string}
         */
        TransactionPlatform: "COINBASE" | "STRIPE" | "TAO" | "ALPHA" | "REFERRAL" | "ADMIN" | "NOWPAYMENTS" | "TMC_PAY";
        /**
         * TransactionResponse
         * @description One row of GET /transactions: the Transaction columns plus two flags the wallet page's
         *     analytics read (DAH-3516). Computed per response; nothing is stored.
         */
        TransactionResponse: {
            /** Amount */
            amount?: number | null;
            /** Amount In Usd */
            amount_in_usd?: number | null;
            /**
             * Api Key Id
             * @description The API key that started this payment; null for a browser session.
             */
            api_key_id?: string | null;
            /**
             * Api Key Name
             * @description That key's name at the time of the payment.
             */
            api_key_name?: string | null;
            /** Currency */
            currency?: string | null;
            /** Customer Id */
            customer_id?: string | null;
            /** Description */
            description?: string | null;
            /**
             * Failed At
             * @description When the payment was marked FAILED (UTC).
             */
            failed_at?: string | null;
            /**
             * Failure Reason
             * @description Why a FAILED payment failed, as `<code>: <provider message>`. Codes: `invoice_rejected` (TMC Pay refused to create the invoice; HTTP status and its message), `invoice_expired` / `invoice_cancelled` (TMC Pay closed the invoice unpaid; names any crypto received but not credited), `card_declined` (Stripe auto top-up; decline code and the bank's message). Null on rows failed before this field existed and on non-failed rows.
             */
            failure_reason?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Is Deposit
             * @description True when the renter paid this money in (card, crypto, TAO, alpha) and the payment is COMPLETED with a positive amount. False for pending or failed rows, bonus rows, disputes, payouts, referral and admin credits.
             */
            is_deposit: boolean;
            /**
             * Is First Deposit
             * @description True on exactly one row: the earliest deposit (by paid time) this user ever completed.
             */
            is_first_deposit: boolean;
            platform?: components["schemas"]["TransactionPlatform"] | null;
            /** Reference Id */
            reference_id: string;
            status?: components["schemas"]["TransactionStatus"] | null;
            /** Stripe Invoice Id */
            stripe_invoice_id?: string | null;
            /** Tmc Pay Invoice Id */
            tmc_pay_invoice_id?: string | null;
            /**
             * Transaction Created At
             * Format: date-time
             */
            transaction_created_at: string;
            /** Transaction Paid At */
            transaction_paid_at?: string | null;
            /** User Id */
            user_id?: string | null;
        };
        /**
         * TransactionStatus
         * @enum {string}
         */
        TransactionStatus: "PENDING" | "COMPLETED" | "FAILED";
        /** TransferCreditsDto */
        TransferCreditsDto: {
            /** Amount */
            amount: number;
            /** Description */
            description?: string | null;
            /** Receiver Email */
            receiver_email?: string | null;
            /** Receiver Id */
            receiver_id?: string | null;
        };
        /** TransferHistoryDto */
        TransferHistoryDto: {
            /** Amount */
            amount: number;
            /** Api Key Id */
            api_key_id?: string | null;
            /** Api Key Name */
            api_key_name?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Receiver Email */
            receiver_email?: string | null;
            /**
             * Receiver Id
             * Format: uuid
             */
            receiver_id: string;
            /** Transfer Type */
            transfer_type: string;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * UniquePositiveRentersResponse
         * @description Unique positive renters statistics.
         */
        UniquePositiveRentersResponse: {
            /**
             * Unique Positive Renters
             * @description Number of unique users who gave positive feedback
             */
            unique_positive_renters: number;
        };
        /**
         * UniqueRentersResponse
         * @description Unique renters statistics.
         */
        UniqueRentersResponse: {
            /**
             * Unique Renters
             * @description Number of unique users who rented from this provider
             */
            unique_renters: number;
        };
        /**
         * UpdateUserDto
         * @description PUT /users/me: the fields an account may change on itself. `validator_hotkey` is not one of them (a sent
         *     one is dropped): validator signup (POST /users) and `admin-validator-account` set it.
         */
        UpdateUserDto: {
            /** Archive Hints */
            archive_hints?: string[] | null;
            /** Avatar Url */
            avatar_url?: string | null;
            /** Company Name */
            company_name?: string | null;
            /** Current Password */
            current_password?: string | null;
            /** Disable Incoming Connections */
            disable_incoming_connections?: boolean | null;
            /** Email */
            email?: string | null;
            /** Fingerprint */
            fingerprint?: string | null;
            /** Name */
            name?: string | null;
        };
        /** UpdateUserFeedbackDto */
        UpdateUserFeedbackDto: {
            /** @description Category of the feedback */
            category?: components["schemas"]["FeedbackCategory"] | null;
            /**
             * Description
             * @description Detailed description of the feedback
             */
            description?: string | null;
            /** @description Status of the feedback */
            status?: components["schemas"]["FeedbackStatus"] | null;
            /**
             * Title
             * @description Title of the feedback
             */
            title?: string | null;
        };
        /**
         * UptimeCountsResponse
         * @description Uptime and reset statistics.
         */
        UptimeCountsResponse: {
            /**
             * Average Uptime Hours
             * @description Average current uptime of the live nodes in hours
             */
            average_uptime_hours: number;
            /**
             * Reclaimed Count
             * @description All-time number of node records that have been reclaimed/reset
             */
            reclaimed_count: number;
            /**
             * Total Gpus
             * @description Number of GPUs on the live nodes
             * @default 0
             */
            total_gpus: number;
            /**
             * Total Machines
             * @description Number of live nodes (the nodes the provider page lists)
             */
            total_machines: number;
        };
        /** UserFeedbackDeleteResponse */
        UserFeedbackDeleteResponse: {
            /**
             * Feedback Id
             * Format: uuid
             * @description ID of the deleted feedback
             */
            feedback_id: string;
            /**
             * Message
             * @description Success message
             */
            message: string;
        };
        /** UserFeedbackResponse */
        UserFeedbackResponse: {
            category: components["schemas"]["FeedbackCategory"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            status: components["schemas"]["FeedbackStatus"];
            /** Title */
            title: string;
            /** Updated At */
            updated_at: string | null;
            /** User Id */
            user_id: string | null;
        };
        /**
         * UserResponseDto
         * @description The user account in the shape a client may see.
         *
         *     Endpoints that hand a User row back go through this DTO, so the bcrypt hash never
         *     leaves the server. The signup forensics — ``ip_address``, ``signup_attribution``,
         *     ``referred_by_miner_id``, ``referred_by_code_id`` — stay out for the same reason: no client reads them
         *     (``GET /users/me`` shows the partner code itself as ``referred_by``, built by ``UserService.get_user_info``).
         */
        UserResponseDto: {
            /** Admin */
            admin: boolean | null;
            /** Archive Hints */
            archive_hints: string[] | null;
            /** Avatar Url */
            avatar_url: string | null;
            /** Balance */
            balance: number | null;
            /** Company Name */
            company_name: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Deleted At */
            deleted_at: string | null;
            /** Disable Incoming Connections */
            disable_incoming_connections: boolean;
            /** Discord Id */
            discord_id: string | null;
            /** Email */
            email: string | null;
            /** Email Verified */
            email_verified: boolean | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Internal Member */
            internal_member: boolean | null;
            /** Name */
            name: string;
            /** Pending Email */
            pending_email?: string | null;
            /** Pending Referral Balance */
            pending_referral_balance: number | null;
            /** Referral Code */
            referral_code: string | null;
            referral_payout_method: components["schemas"]["ReferralPayoutMethod"];
            /** Referral Payout Wallet Id */
            referral_payout_wallet_id: string | null;
            /** Stripe Connect Account Id */
            stripe_connect_account_id: string | null;
            /** Stripe Customer Id */
            stripe_customer_id: string | null;
            /** Stripe Onboarding Completed */
            stripe_onboarding_completed: boolean | null;
            /** Updated At */
            updated_at: string | null;
            /** Validator Hotkey */
            validator_hotkey: string | null;
        };
        /** ValidateReferralResponse */
        ValidateReferralResponse: {
            /** Referrer Name */
            referrer_name?: string | null;
            /** Valid */
            valid: boolean;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /**
         * VerifyWalletRequest
         * @description POST /token/verify's body. ``stripe_customer_id`` may be omitted; if sent it must be the caller's.
         *     ``application_id`` is accepted for the old callers and ignored, like ``app_id`` on /wallet/company/: staging's
         *     dashboard sends an id that is not this deployment's, and the binding is always this deployment's app.
         */
        VerifyWalletRequest: {
            /** Access Key */
            access_key: string;
            /** Application Id */
            application_id?: string | null;
            /** Coldkey Address */
            coldkey_address: string;
            /** Signature */
            signature: string;
            /** Stripe Customer Id */
            stripe_customer_id?: string | null;
        };
        /**
         * VolumeCostsPaginatedResponse
         * @description Paginated response for volume costs
         */
        VolumeCostsPaginatedResponse: {
            /** Data */
            data: components["schemas"]["VolumeCostsResponse"][];
            /**
             * Filters
             * @description Applied filters
             */
            filters: {
                [key: string]: unknown;
            };
            /**
             * Pagination
             * @description Pagination metadata
             */
            pagination: {
                [key: string]: unknown;
            };
            /**
             * Summary
             * @description Cost summary for the period
             */
            summary: {
                [key: string]: unknown;
            };
        };
        /**
         * VolumeCostsResponse
         * @description Response model for volume cost data
         */
        VolumeCostsResponse: {
            /**
             * Billing Period End
             * @description Billing period end date
             */
            billing_period_end?: string | null;
            /**
             * Billing Period Start
             * @description Billing period start date
             */
            billing_period_start?: string | null;
            /**
             * Bucket Size Gb
             * @description Calculated bucket size in GB
             * @default 0
             */
            bucket_size_gb: number;
            /**
             * Chargeable Cost
             * @description Cost charged to user (custom_storage_cost plus egress at AWS cost)
             * @default 0
             */
            chargeable_cost: number;
            /**
             * Custom Storage Cost
             * @description Storage dollars charged for the day (the storage part of the volume's price; see the pricing FAQ)
             * @default 0
             */
            custom_storage_cost: number;
            /**
             * Date
             * @description Date in YYYY-MM-DD format
             */
            date: string;
            /**
             * Egress Cost
             * @description AWS data transfer out costs in USD, as charged (0 on an unbilled backup day)
             */
            egress_cost: number;
            /**
             * Other Costs
             * @description AWS Other S3 costs in USD
             */
            other_costs: number;
            /**
             * Requests Cost
             * @description AWS Combined request costs in USD
             */
            requests_cost: number;
            /**
             * Requests Tier1 Cost
             * @description AWS Tier 1 request costs (PUT, POST, etc.) in USD
             */
            requests_tier1_cost: number;
            /**
             * Requests Tier2 Cost
             * @description AWS Tier 2 request costs (GET, etc.) in USD
             */
            requests_tier2_cost: number;
            /**
             * Storage Cost
             * @description AWS Storage costs in USD
             */
            storage_cost: number;
            /**
             * Total Cost
             * @description AWS storage, requests and other costs plus egress as charged, in USD
             */
            total_cost: number;
            /**
             * Volume Deleted
             * @description The volume was deleted after this day (include_deleted=true)
             * @default false
             */
            volume_deleted: boolean;
            /**
             * Volume Id
             * @description Volume ID (null if grouped by date)
             */
            volume_id?: string | null;
            /**
             * Volume Name
             * @description Volume name (null if grouped by date)
             */
            volume_name?: string | null;
        };
        /**
         * VolumeCostSummaryResponse
         * @description Response model for volume cost summary
         */
        VolumeCostSummaryResponse: {
            /** Cost Breakdown */
            cost_breakdown: {
                [key: string]: unknown;
            };
            /** Date Range */
            date_range: {
                [key: string]: unknown;
            };
            /**
             * Top Volumes
             * @description Top 5 most expensive volumes
             */
            top_volumes: {
                [key: string]: unknown;
            }[];
            /** Total Volumes */
            total_volumes: number;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * VolumeCreateRequest
         * @example {
         *       "description": "my volume description",
         *       "name": "my volume"
         *     }
         */
        VolumeCreateRequest: {
            /** Description */
            description?: string | null;
            /** Name */
            name: string;
        };
        /**
         * VolumeEncryptionStatus
         * @enum {string}
         */
        VolumeEncryptionStatus: "ENABLED" | "UNSUPPORTED_IMAGE" | "DISABLED" | "FAILED";
        /**
         * VolumeForPodResponse
         * @description Volume information for pod responses (without circular pod reference)
         */
        VolumeForPodResponse: {
            /** Bucket Name */
            bucket_name: string;
            /** Created At */
            created_at?: string | null;
            /** Description */
            description?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Plugin */
            plugin: string;
            /** Updated At */
            updated_at?: string | null;
        };
        /** VolumeResponse */
        VolumeResponse: {
            /** Created At */
            created_at: string;
            /** Current File Count */
            current_file_count?: number | null;
            /** Current Size Bytes */
            current_size_bytes?: number | null;
            /** Current Size Gb */
            current_size_gb?: number | null;
            /** Current Size Mb */
            current_size_mb?: number | null;
            /** Description */
            description?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Metrics Update */
            last_metrics_update?: string | null;
            /** Name */
            name: string;
            pod?: components["schemas"]["Pod"] | null;
            /** Updated At */
            updated_at: string;
        };
        /** WithdrawReferralRewardsResponse */
        WithdrawReferralRewardsResponse: {
            /** Amount */
            amount: number;
            /** Currency */
            currency: string;
            /** Message */
            message: string;
            /** New Main Balance */
            new_main_balance: number | null;
            /** New Pending Balance */
            new_pending_balance: number;
            /**
             * Payout Id
             * Format: uuid
             */
            payout_id: string;
            /** Payout Method */
            payout_method: string;
            /** Status */
            status: string;
            /** Success */
            success: boolean;
        };
        /** WorkspaceCreateRequest */
        WorkspaceCreateRequest: {
            /**
             * Name
             * @description Shown to every member; not unique.
             */
            name: string;
        };
        /**
         * WorkspaceEventResponse
         * @description One entry of a workspace's audit log, flattened from the stored Event row — never the raw row.
         */
        WorkspaceEventResponse: {
            /** @description Session or API key behind the request. */
            actor?: components["schemas"]["ActorMetadata"] | null;
            /**
             * Actor User Id
             * @description The signed-in user who made the change.
             */
            actor_user_id?: string | null;
            /** Created At */
            created_at: string | null;
            /** Detail */
            detail?: string | null;
            /** Error */
            error?: string | null;
            /** Event Type */
            event_type: string | null;
            /** From Role */
            from_role?: string | null;
            /** From Status */
            from_status?: string | null;
            /** From User Id */
            from_user_id?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Invitation Id */
            invitation_id?: string | null;
            /** Member User Id */
            member_user_id?: string | null;
            /** New Name */
            new_name?: string | null;
            /** Old Name */
            old_name?: string | null;
            /** Pod Id */
            pod_id?: string | null;
            /** Pod Name */
            pod_name?: string | null;
            /** Reason */
            reason?: string | null;
            /** Sub Event Type */
            sub_event_type?: string | null;
            /** To Role */
            to_role?: string | null;
            /** To Status */
            to_status?: string | null;
            /** To User Id */
            to_user_id?: string | null;
            /** Workspace Id */
            workspace_id?: string | null;
        };
        /** WorkspaceInvitationCreateRequest */
        WorkspaceInvitationCreateRequest: {
            /**
             * Email
             * Format: email
             * @description Where the invitation is sent: exactly one address, lower-cased; it need not have a Lium account yet. 422 for anything that is not one plain address.
             */
            email: string;
            /**
             * Role
             * @description Admins may grant `admin` or `member`; owners any role.
             * @default member
             * @enum {string}
             */
            role: "owner" | "admin" | "member";
        };
        /**
         * WorkspaceInvitationPreviewResponse
         * @description What the holder of an invitation link sees before signing in: enough to decide, nothing more.
         *
         *     The link alone does not prove the holder is the invitee (mail gets forwarded), so the address is masked:
         *     the invitee recognises it, a stranger cannot read it off and sign up on it.
         */
        WorkspaceInvitationPreviewResponse: {
            /**
             * Email
             * @description The invited address, masked (`d***@example.com`); the accepting session must belong to it.
             */
            email: string;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
            /** Inviter Name */
            inviter_name: string | null;
            role: components["schemas"]["WorkspaceRole"];
            /**
             * Status
             * @enum {string}
             */
            status: "pending" | "accepted" | "revoked" | "expired";
            /** Workspace Name */
            workspace_name: string;
        };
        /** WorkspaceInvitationResponse */
        WorkspaceInvitationResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
            /**
             * Email Sent
             * @description On creation only: whether the e-mail left. False means revoke and invite again.
             */
            email_sent?: boolean | null;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Invited By User Id
             * Format: uuid
             */
            invited_by_user_id: string;
            role: components["schemas"]["WorkspaceRole"];
            /**
             * Status
             * @enum {string}
             */
            status: "pending" | "accepted" | "revoked" | "expired";
            /**
             * Workspace Id
             * Format: uuid
             */
            workspace_id: string;
        };
        /** WorkspaceMemberAddRequest */
        WorkspaceMemberAddRequest: {
            /**
             * Email
             * @description E-mail of an existing Lium account; the member is added at once, no invitation.
             */
            email: string;
            /**
             * Role
             * @description Admins may grant `admin` or `member`; owners any role.
             * @default member
             * @enum {string}
             */
            role: "owner" | "admin" | "member";
        };
        /** WorkspaceMemberResponse */
        WorkspaceMemberResponse: {
            /** Email */
            email: string | null;
            /** Is Billing Owner */
            is_billing_owner: boolean;
            /**
             * Joined At
             * Format: date-time
             */
            joined_at: string;
            /** Name */
            name: string;
            role: components["schemas"]["WorkspaceRole"];
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** WorkspaceMemberRoleRequest */
        WorkspaceMemberRoleRequest: {
            /**
             * Role
             * @enum {string}
             */
            role: "owner" | "admin" | "member";
        };
        /** WorkspaceResponse */
        WorkspaceResponse: {
            /**
             * Billing Owner User Id
             * Format: uuid
             * @description Whose balance pays for the workspace's resources.
             */
            billing_owner_user_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /**
             * Pending Billing Owner User Id
             * @description A member asked to take over billing who has not accepted yet.
             */
            pending_billing_owner_user_id?: string | null;
            /** @description The caller's role in this workspace. */
            role: components["schemas"]["WorkspaceRole"];
        };
        /**
         * WorkspaceRole
         * @enum {string}
         */
        WorkspaceRole: "owner" | "admin" | "member";
        /** WorkspaceUpdateRequest */
        WorkspaceUpdateRequest: {
            /**
             * Name
             * @description Shown to every member; not unique.
             */
            name: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health_check__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    list_account_audit_account_audit_get: {
        parameters: {
            query?: {
                action?: string | null;
                api_key_id?: string | null;
                cursor?: string | null;
                limit?: number;
                resource_id?: string | null;
                since?: string | null;
                source?: string | null;
                until?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountAuditPage"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    export_account_audit_account_audit_export_get: {
        parameters: {
            query?: {
                action?: string | null;
                api_key_id?: string | null;
                resource_id?: string | null;
                since?: string | null;
                source?: string | null;
                until?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/csv": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    my_api_plan_api_plans_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiPlanResponse"];
                };
            };
        };
    };
    set_auto_renew_api_plans_me_patch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AutoRenewRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiPlanResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    subscribe_pro_api_plans_pro_subscribe_post: {
        parameters: {
            query?: never;
            header?: {
                /** @description Makes a retry safe: the same key with the byte-identical body returns the first call's answer with `Idempotent-Replayed: true`, for a year after an answer that rented a pod and 24 h otherwise (for an older rental, check GET /pods before retrying); a stored 4xx (refusal) gives way to the same key with a corrected body; a different body after a stored 2xx is 422 `idempotency_key_reused`; a repeat while the first call runs is 409 `idempotency_in_progress`; a repeat of a call that may have rented but whose answer was not recorded is 409 `idempotency_outcome_unknown`, with no expiry. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiPlanResponse"];
                };
            };
            /** @description The balance does not cover the monthly price, or the API key's budget is reached */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description API plans are off */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The paid plan has no price yet */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    login_with_github_auth_github_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OAuth2LoginURLRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    github_login_complete_auth_github_login_complete_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OAuthHandlerRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OAuthLoginResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    login_with_google_auth_google_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OAuth2LoginURLRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    google_login_complete_auth_google_login_complete_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OAuthHandlerRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OAuthLoginResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    fingerprint_login_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FingerprintLoginRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    logout_auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    refresh_session_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    resend_verify_email_auth_resend_verify_email_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResendVerifyEmailRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    fingerprint_signup_auth_signup_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["FingerprintSignupRequest"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FingerprintSignupResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_email_auth_verify_email_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailVerifyRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_backup_configurations_backup_configs_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Backup configurations retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupConfiguration"][];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_backup_configuration_backup_configs_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BackupConfigurationCreateRequest"];
            };
        };
        responses: {
            /** @description Create backup configuration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupConfiguration"];
                };
            };
            /** @description Backup configuration created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid input or configuration already exists */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update_backup_configuration_backup_configs__config_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                config_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BackupConfigurationUpdateRequest"];
            };
        };
        responses: {
            /** @description Backup configuration updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupConfiguration"];
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Configuration does not belong to user */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Backup configuration not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    delete_backup_configuration_backup_configs__config_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                config_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Backup configuration deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Backup configuration not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_backup_configuration_backup_configs_pod__pod_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pod_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Backup configuration retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupConfiguration"];
                };
            };
            /** @description Backup configuration not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_all_backup_logs_backup_logs__get: {
        parameters: {
            query?: {
                backup_type?: string | null;
                limit?: number;
                page?: number;
                pod_id?: string | null;
                search?: string | null;
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Backup logs retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_BackupLogEnhancedResponse_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_backup_log_backup_logs__backup_log_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                backup_log_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Backup log retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupLogResponse"];
                };
            };
            /** @description Backup log not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    cancel_backup_backup_logs__backup_log_id__cancel_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                backup_log_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    refresh_backup_credentials_backup_logs__backup_log_id__credentials_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                backup_log_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid or expired authentication token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Backup log not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description This backup does not use scoped credentials */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Backup is no longer running, was cancelled, or has run past the renewal limit */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_backup_progress_backup_logs__backup_log_id__progress_put: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                backup_log_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BackupProgressUpdateRequest"];
            };
        };
        responses: {
            /** @description Backup progress updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid or expired authentication token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Backup log not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    delete_backup_log_backup_logs__log_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                log_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Backup log deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Backup log is already deleted */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Backup log does not belong to user */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Backup log not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    bulk_delete_backup_logs_backup_logs_bulk_delete_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BulkDeleteBackupLogsRequest"];
            };
        };
        responses: {
            /** @description Start bulk delete backup logs task */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Bulk delete task initiated */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_bulk_delete_status_backup_logs_bulk_delete_status__task_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                task_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Task status retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Task not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_backup_logs_for_pod_backup_logs_pod__pod_id__get: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path: {
                pod_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Backup logs retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_BackupLogResponse_"];
                };
            };
            /** @description The pod belongs to another account */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No such pod, and no backup of it belongs to the caller */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    billing_history_for_miner_billing_billing_history__miner_coldkey__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                miner_coldkey: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Get the billing history for a provider */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingHistoryForMinerResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    billing_info_for_users_billing_billing_info_for_users_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Get the billing info for a user */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingInfoForUserResponse"];
                };
            };
        };
    };
    billing_per_day_billing_billing_per_day_get: {
        parameters: {
            query: {
                api_key_id?: string | null;
                end_day: string;
                start_day: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Get the billing info per day */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingPerDayResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    revenue_for_validators_billing_revenue_for_validators_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    billing_statement_billing_statement_get: {
        parameters: {
            query?: {
                api_key_id?: string | null;
                end_day?: string | null;
                start_day?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The account's pod charges grouped by pod */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingStatementResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_bookmarked_providers_bookmark_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of bookmarked provider hotkeys */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    bookmark_provider_bookmark__miner_hotkey__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                miner_hotkey: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Provider bookmarked successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BaseResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    unbookmark_provider_bookmark__miner_hotkey__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                miner_hotkey: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Provider bookmark removed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BaseResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_executors_from_bookmarked_providers_bookmark_executors_get: {
        parameters: {
            query?: {
                page?: number | null;
                size?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of available nodes from bookmarked providers */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutorDetailResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    upload_build_context_build_contexts_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/gzip": string;
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BuildContextUploadResponse"];
                };
            };
        };
    };
    approve_cli_auth_session_cli_auth_approve_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CliAuthApproveRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CliAuthApproveResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    init_cli_auth_session_cli_auth_init_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["CliAuthInitRequest"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CliAuthInitResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    poll_cli_auth_session_cli_auth_poll__session_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CliAuthPollResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    cli_auth_session_status_cli_auth_status__approval_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                approval_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CliAuthStatusResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_cluster_clusters__cluster_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cluster_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The cluster's start outcome and its member pods */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClusterStatusResponse"];
                };
            };
            /** @description Cluster not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_cluster_clusters__cluster_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cluster_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deletion requested for every member; `success` is false when a member failed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClusterDeleteResponse"];
                };
            };
            /** @description The cluster belongs to another user, or the API key lacks the manage scope */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cluster not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_charge_coinbase_create_charge_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CoinbaseCreateChargeRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    webhooks_coinbase_webhook_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    list_crypto_wallets_crypto_wallets_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CryptoWalletResponse"][];
                };
            };
        };
    };
    add_crypto_wallet_crypto_wallets_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddCryptoWalletRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CryptoWalletResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_crypto_wallet_crypto_wallets__wallet_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                wallet_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    set_default_crypto_wallet_crypto_wallets__wallet_id__set_default_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                wallet_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CryptoWalletResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    daily_aggregate_csv_data_partners_daily_aggregate_csv_get: {
        parameters: {
            query?: {
                /** @description One complete UTC calendar day, YYYY-MM-DD, yesterday or earlier. The same rows the nightly dump of that day holds. Not with `from`/`to`. */
                day?: string | null;
                /** @description First calendar day (UTC) of rental end times, inclusive, YYYY-MM-DD. Not with `day`. */
                from?: string | null;
                /** @description Last calendar day (UTC), inclusive, YYYY-MM-DD; today when omitted. At most 62 days per call. */
                to?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description CSV, LF line ends, header on the first line */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "text/csv": unknown;
                };
            };
            /** @description No session and no valid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The account is not a data partner, or the API key lacks the read scope */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Neither `from` nor `day`, both of them, `to` before `from`, a window over the day cap, or a `day` not closed yet */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The feed is not configured on this deployment (no hash salt) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    trades_dump_data_partners_dumps__day__csv_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                day: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The stored file for that day */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "text/csv": unknown;
                };
            };
            /** @description No session and no valid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The account is not a data partner, or the API key lacks the read scope */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No dump for that day: it is not closed yet, or the 01:00 UTC task has not written it */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description The feed is not configured on this deployment (no hash salt) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    daily_aggregate_dump_data_partners_dumps__day__daily_aggregate_csv_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                day: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The stored file for that day */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "text/csv": unknown;
                };
            };
            /** @description No session and no valid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The account is not a data partner, or the API key lacks the read scope */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No dump for that day: it is not closed yet, or the 01:00 UTC task has not written it */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description The feed is not configured on this deployment (no hash salt) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    hourly_gpu_csv_data_partners_hourly_gpu_csv_get: {
        parameters: {
            query?: {
                /** @description Closed UTC hours back from now */
                hours?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description CSV, LF line ends, header on the first line */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "text/csv": unknown;
                };
            };
            /** @description No session and no valid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The account is not a data partner, or the API key lacks the read scope */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Neither `from` nor `day`, both of them, `to` before `from`, a window over the day cap, or a `day` not closed yet */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    trades_csv_data_partners_trades_csv_get: {
        parameters: {
            query?: {
                /** @description One complete UTC calendar day, YYYY-MM-DD, yesterday or earlier. The same rows the nightly dump of that day holds. Not with `from`/`to`. */
                day?: string | null;
                /** @description First calendar day (UTC) of rental end times, inclusive, YYYY-MM-DD. Not with `day`. */
                from?: string | null;
                /** @description Last calendar day (UTC), inclusive, YYYY-MM-DD; today when omitted. At most 62 days per call. */
                to?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description CSV, LF line ends, header on the first line */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                    "text/csv": unknown;
                };
            };
            /** @description No session and no valid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The account is not a data partner, or the API key lacks the read scope */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Neither `from` nor `day`, both of them, `to` before `from`, a window over the day cap, or a `day` not closed yet */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The feed is not configured on this deployment (no hash salt) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_docker_credentials__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DockerCredentialResponse"][];
                };
            };
        };
    };
    create_docker_credentials__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["DockerCredentialUpdateCreateDto"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DockerCredentialResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    find_one_docker_credentials__docker_credential_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                docker_credential_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DockerCredentialResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_docker_credentials__docker_credential_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                docker_credential_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DockerCredentialUpdateCreateDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DockerCredentialResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_docker_credentials__docker_credential_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                docker_credential_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_available_executors_executors_get: {
        parameters: {
            query?: {
                bookmarked?: boolean | null;
                gpu_count_gte?: number | null;
                gpu_count_lte?: number | null;
                hide_power_limited?: boolean | null;
                lat?: number | null;
                lon?: number | null;
                machine_names?: string | null;
                machine_request_id?: string | null;
                max_distance_mile?: number | null;
                min_download_mbps?: number | null;
                ncu_profiling_enabled?: boolean | null;
                nvlink?: boolean | null;
                page?: number | null;
                price_gte?: number | null;
                price_lte?: number | null;
                reliable_only?: boolean | null;
                size?: number | null;
                view?: "full" | "summary";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of available nodes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutorDetailResponse"][];
                };
            };
            /** @description Listing unchanged since the ETag sent in If-None-Match */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_hardware_utilization_executors__executor_uuid__hardware_utilization_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                executor_uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Hardware utilization metrics, or null when the node did not answer (5 s connect, 5 s read) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    } | null;
                };
            };
            /** @description Not authenticated */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The node is rented by another user */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Node not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description More than 30 calls a minute from one address */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Failed to retrieve metrics */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_job_quote_executors__executor_uuid__quote_get: {
        parameters: {
            query: {
                backup_gb?: number;
                /** @description Default: the node's free GPUs (what `lium up <node>` rents); every GPU when none is free */
                gpu_count?: number | null;
                hours: number;
                volume_gb?: number;
            };
            header?: never;
            path: {
                executor_uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobQuoteResponse"];
                };
            };
            /** @description gpu_count above the node's GPUs */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unknown or unpriced node */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rent_executors__executor_uuid__rent_post: {
        parameters: {
            query?: never;
            header?: {
                /** @description Makes a retry safe: the same key with the byte-identical body returns the first call's answer with `Idempotent-Replayed: true`, for a year after an answer that rented a pod and 24 h otherwise (for an older rental, check GET /pods before retrying); a stored 4xx (refusal) gives way to the same key with a corrected body; a different body after a stored 2xx is 422 `idempotency_key_reused`; a repeat while the first call runs is 409 `idempotency_in_progress`; a repeat of a call that may have rented but whose answer was not recorded is 409 `idempotency_outcome_unknown`, with no expiry. */
                "Idempotency-Key"?: string;
                /** @description Your tag for the end customer of this one rental; overrides the key's customer_ref. */
                "X-Customer-Ref"?: string;
            };
            path: {
                executor_uuid: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RentExecutorRequest"];
            };
        };
        responses: {
            /** @description Rent node */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rent_cluster_executors_cluster_rent_post: {
        parameters: {
            query?: never;
            header?: {
                /** @description Makes a retry safe: the same key with the byte-identical body returns the first call's answer with `Idempotent-Replayed: true`, for a year after an answer that rented a pod and 24 h otherwise (for an older rental, check GET /pods before retrying); a stored 4xx (refusal) gives way to the same key with a corrected body; a different body after a stored 2xx is 422 `idempotency_key_reused`; a repeat while the first call runs is 409 `idempotency_in_progress`; a repeat of a call that may have rented but whose answer was not recorded is 409 `idempotency_outcome_unknown`, with no expiry. */
                "Idempotency-Key"?: string;
                /** @description Your tag for the end customer of this one rental; overrides the key's customer_ref. */
                "X-Customer-Ref"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RentClusterRequest"];
            };
        };
        responses: {
            /** @description Rent a cluster of nodes on one InfiniBand fabric */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    count_executors_executors_count_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailableCountExecutorResponse"];
                };
            };
        };
    };
    get_default_docker_image_executors_default_docker_image_get: {
        parameters: {
            query: {
                driver_version: string;
                gpu_model: string;
                include_pre_pull?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description get default docker image of node */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DefaultDockerImage"][];
                };
            };
            /** @description Unchanged since the ETag sent in If-None-Match */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Node not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_deployment_estimate_executors_deployment_estimate_get: {
        parameters: {
            query: {
                executor_id: string;
                template_id: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeploymentEstimateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_infiniband_clusters_executors_infiniband_clusters_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List rentable InfiniBand clusters */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InfinibandClusterResponse"][];
                };
            };
        };
    };
    rent_by_spec_executors_rent_by_spec_post: {
        parameters: {
            query?: never;
            header?: {
                /** @description Makes a retry safe: the same key with the byte-identical body returns the first call's answer with `Idempotent-Replayed: true`, for a year after an answer that rented a pod and 24 h otherwise (for an older rental, check GET /pods before retrying); a stored 4xx (refusal) gives way to the same key with a corrected body; a different body after a stored 2xx is 422 `idempotency_key_reused`; a repeat while the first call runs is 409 `idempotency_in_progress`; a repeat of a call that may have rented but whose answer was not recorded is 409 `idempotency_outcome_unknown`, with no expiry. */
                "Idempotency-Key"?: string;
                /** @description Your tag for the end customer of this one rental; overrides the key's customer_ref. */
                "X-Customer-Ref"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RentBySpecRequest"];
            };
        };
        responses: {
            /** @description The pod (or, on a dry run, the pick alone) with the node chosen and the runners-up */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RentBySpecResponse"];
                };
            };
            /** @description No rentable node satisfies the spec */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RentBySpecNoMatchResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description The node catalogue has not finished its first read; retry after a few seconds */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_stats_of_executors_executors_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stats of nodes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutorStatsResponse"][];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_total_count_of_active_executors_executors_total_count_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TotalCountExecutorResponse"];
                };
            };
        };
    };
    executors_snapshot_executors_ws_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "type": "snapshot",
                     *       "schema_version": 1,
                     *       "seq": 42,
                     *       "ts": 1787572800.5,
                     *       "executors": [
                     *         {
                     *           "id": "ad83de56-8a04-4ab1-ac5a-4ab007b4e2b3",
                     *           "machine_name": "NVIDIA H200",
                     *           "gpu_class": "NVIDIA H200",
                     *           "gpu_class_display": "NVIDIA H200",
                     *           "price_per_gpu": 2.5,
                     *           "validator_hotkey": "5HSmo1xhdZz4Y82KCfj2cJRucaCRDgNi1e2YpHzFTQ3mtP4y",
                     *           "gpu_count": 8,
                     *           "available_gpu_count": 8,
                     *           "active": true,
                     *           "uptime_in_minutes": 4815,
                     *           "miner_hotkey": "5F7X5UpKSr26KU3jKfpLmT8kuKtBNyHhEnfS8xtxPCqCb13p",
                     *           "is_slow_machine": false,
                     *           "tier": "secure",
                     *           "reliability_score": 97,
                     *           "frequent_rent_failures": false,
                     *           "min_gpu_count_for_rental": 1,
                     *           "max_cuda_version": 13,
                     *           "infiniband_fabric_rentable": false,
                     *           "roce_fabric_rentable": false,
                     *           "ncu_profiling_enabled": true,
                     *           "disk_health_ok": true,
                     *           "on_infiniband_fabric": false,
                     *           "on_roce_fabric": false,
                     *           "gpu_power_limited": false,
                     *           "gpu_power_limit_w": 700,
                     *           "gpu_power_limit_default_w": 700,
                     *           "location": {
                     *             "country": "United States",
                     *             "country_code": "US",
                     *             "region": "TX",
                     *             "region_name": "Texas",
                     *             "city": "Dallas",
                     *             "zip": "75201",
                     *             "lat": 32.7767,
                     *             "lon": -96.797,
                     *             "timezone": "America/Chicago"
                     *           },
                     *           "specs": {
                     *             "os": "Debian GNU/Linux 13 (trixie)",
                     *             "kernel": "6.12.0",
                     *             "is_spot": false,
                     *             "sysbox_runtime": true,
                     *             "storage_limit_supported": true,
                     *             "tdx_host_supported": false,
                     *             "tdx_attestation_passed": false,
                     *             "ncu_profiling_access": "unrestricted",
                     *             "gpu_power_cap_capable": true,
                     *             "available_port_count": 40,
                     *             "gpu": {
                     *               "count": 8,
                     *               "driver": "580.173.02",
                     *               "cuda_driver": 13000,
                     *               "details": [
                     *                 {
                     *                   "name": "NVIDIA H200",
                     *                   "capacity": 143771,
                     *                   "cuda": "9.0",
                     *                   "power_limit": 700
                     *                 }
                     *               ]
                     *             },
                     *             "gpu_metrics": {
                     *               "device": "NVIDIA H200",
                     *               "cc": "9.0",
                     *               "vram_gb": 150.4,
                     *               "sm_count": 132,
                     *               "clock_mhz": 1980,
                     *               "fp32_tflops": 8.1
                     *             },
                     *             "cpu": {
                     *               "count": 128,
                     *               "model": "INTEL(R) XEON(R) GOLD 6530"
                     *             },
                     *             "ram": {
                     *               "total": 1056539016,
                     *               "pod_reserve": 31696170
                     *             },
                     *             "hard_disk": {
                     *               "total": 29999499264,
                     *               "free": 29287119836
                     *             },
                     *             "interconnect": {
                     *               "gpu_pairs": 28,
                     *               "nvlink_pairs": 28
                     *             }
                     *           },
                     *           "effective_upload_speed_mbps": 25.2,
                     *           "effective_download_speed_mbps": 546.6,
                     *           "nvlink": true
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["ExecutorSnapshotResponse"];
                };
            };
            /** @description The publisher has no state yet */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_user_feedbacks_feedbacks_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserFeedbackResponse"][];
                };
            };
        };
    };
    create_feedback_feedbacks_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateUserFeedbackDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserFeedbackResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_feedback_by_id_feedbacks__feedback_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                feedback_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserFeedbackResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_feedback_feedbacks__feedback_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                feedback_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserFeedbackDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserFeedbackResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_feedback_feedbacks__feedback_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                feedback_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserFeedbackDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_api_keys_keys_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyResponse"][];
                };
            };
        };
    };
    create_api_key_keys_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApiKeyCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_api_key_keys__api_key_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_api_key_keys__api_key_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApiKeyUpdateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_api_key_keys__api_key_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    patch_api_key_keys__api_key_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApiKeyPatchRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_api_key_refusals_keys__api_key_id__refusals_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyBudgetRefusalResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_api_key_scopes_keys_scopes_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    find_templates_locations_country_codes_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    find_machine_requests_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The aggregate (anonymous) or the caller's requests (authenticated) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MachineRequestDetailsResponse"][] | components["schemas"]["MachineRequestFeedSummary"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_machine_requests_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MachineRequestDto"];
            };
        };
        responses: {
            /** @description Machine request created successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_request_machine_requests__request_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Request retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MachineRequestDetailsResponse"];
                };
            };
            /** @description No JWT or API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found, or not the caller's */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update_machine_requests__request_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                request_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MachineRequestDto"];
            };
        };
        responses: {
            /** @description Request updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    close_request_machine_requests__request_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Request closed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    achieve_machine_requests__request_id__achieve_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Request achieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_executors_for_request_machine_requests__request_id__executors_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of nodes assigned to the machine request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Executor"][];
                };
            };
            /** @description No JWT or API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found, or not the caller's */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_machines_machines_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List all available machines */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MachineListResponse"][];
                };
            };
            /** @description Unchanged since the ETag sent in If-None-Match */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_capacity_machines_capacity_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Open earning capacity per base GPU model, grouped by gpu_count bucket */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BucketCapacityRow"][];
                };
            };
        };
    };
    list_capacity_ineligible_machines_capacity_ineligible_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Base GPU models the validator pays no idle pay for, with its reason code */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IneligibleModel"][];
                };
            };
        };
    };
    estimate_machines_estimate_get: {
        parameters: {
            query: {
                gpu_count?: number;
                gpu_model: string;
                gpu_splitting?: boolean;
                gpu_splitting_min_count?: number | null;
                is_rented?: boolean;
                price_per_gpu?: number | null;
                sysbox_runtime?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Get estimated TAO per epoch for a specific GPU configuration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GpuEstimateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_spot_idle_rates_machines_spot_idle_rates_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Spot idle pay per GPU-hour, subject to change */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpotIdleRate"][];
                };
            };
        };
    };
    list_nodes_nodes_get: {
        parameters: {
            query?: {
                machine_request_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_notification_catalog_notifications_catalog_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationCatalogResponse"];
                };
            };
        };
    };
    my_rentals_partners_me_rentals_get: {
        parameters: {
            query?: {
                /** @description `day` (one row per UTC day), `gpu` (one row per GPU model; `volume` for storage charges) or `customer_ref` (one row per end-customer tag; `untagged` for rentals without one). */
                group_by?: "day" | "gpu" | "customer_ref";
                /** @description First UTC day of the window, inclusive: an ISO date (`2026-09-01`) or date-time (a time zone offset is honoured, then the UTC day is taken). Default: 30 days ending at `until`. */
                since?: string | null;
                /** @description Last UTC day of the window, inclusive, same forms as `since`. Default: today (UTC). */
                until?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The rows for the window; `Cache-Control: private, max-age=300` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResellerReportResponse"];
                };
            };
            /** @description No session and no valid API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The API key lacks the read scope */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description `until` before `since`, a window over 366 days, or an unreadable date */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    top_up_by_card_payments_topup_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApiCardTopUpRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiCardTopUpResponse"];
                };
            };
            /** @description processing: outcome pending, settled by the webhook */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiCardTopUpResponse"];
                };
            };
            /** @description CARD_AUTHENTICATION_REQUIRED (with next_action_url: hand it to the cardholder; a repeat with the same idempotency_key returns the same URL until the cardholder confirms) · CARD_AUTHENTICATION_NOT_COMPLETED · CARD_AUTHENTICATION_UNAVAILABLE · CARD_AUTHENTICATION_EXPIRED (not confirmed within 7 days of the top-up's start: canceled, nothing charged) · CARD_DECLINED · NO_SAVED_CARD · NO_DEFAULT_CARD · WALLET_NOT_SUPPORTED (Link or another wallet; charge a saved card) · API_KEY_BUDGET_EXCEEDED (a key at its budget; the body names the window) */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Feature off, key without the `billing` scope, or a workspace member's key */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_METHOD_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The idempotency_key is recorded for another account */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AMOUNT_BELOW_MINIMUM or an invalid body */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description STRIPE_UNAVAILABLE (retrieve/list, nothing charged) · STRIPE_REFUSED (refused before processing) · PAYMENT_NOT_COMPLETED (unexpected PaymentIntent status) */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description TOP_UP_BUSY: too many top-ups in flight on this server; nothing charged, retry */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_user_payouts_payouts_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PayoutResponse"][];
                };
            };
        };
    };
    get_payout_details_payouts__payout_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                payout_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PayoutResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pods_pods_get: {
        parameters: {
            query?: {
                api_key_id?: string | null;
                bookmarked?: boolean | null;
                gpu_count_gte?: number | null;
                gpu_count_lte?: number | null;
                hide_power_limited?: boolean | null;
                lat?: number | null;
                lon?: number | null;
                machine_names?: string | null;
                machine_request_id?: string | null;
                max_distance_mile?: number | null;
                min_download_mbps?: number | null;
                ncu_profiling_enabled?: boolean | null;
                nvlink?: boolean | null;
                only_favorites?: boolean | null;
                price_gte?: number | null;
                price_lte?: number | null;
                reliable_only?: boolean | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Pods retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PodListItemResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_pod_by_id_pods__id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Pod retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PodDetailResponse"];
                };
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    edit_pod_pods__id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomTemplateRequest"];
            };
        };
        responses: {
            /** @description Pod edited successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TemplateResponse"];
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    delete_pod_pods__id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["FeedbackRequest"] | null;
            };
        };
        responses: {
            /** @description Delete an existing pod */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Pod deleted successfully */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update_pod_pods__id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PodUpdateRequest"];
            };
        };
        responses: {
            /** @description Pod updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Pod"];
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    start_bare_metal_pods__id__bare_metal_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The pod or node cannot go bare-metal */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_pod_discord_channel_pods__id__discord_channel_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PodDiscordChannelRequest"];
            };
        };
        responses: {
            /** @description Discord support channel is ready */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PodDiscordChannelResponse"];
                };
            };
            /** @description Renter or provider has not connected Discord (code RENTER_DISCORD_MISSING / PROVIDER_DISCORD_MISSING) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not authorized, or the provider opted out (code PROVIDER_INCOMING_CONNECTIONS_DISABLED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod or node not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description A create for this pod is already running (code DISCORD_CHANNEL_CREATE_IN_PROGRESS) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Discord refused the create, or Lium failed after calling it (code DISCORD_CHANNEL_CREATE_FAILED) */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Discord pod support is not configured on this platform (code DISCORD_SUPPORT_DISABLED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_pod_events_pods__id__events_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Events retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PodEventResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    install_jupyter_for_pod_pods__id__install_jupyter_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InstallJupyterRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Pod"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    toggle_like_pod_pods__id__like_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Pod liked/unliked successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Pod"];
                };
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    add_multiple_ssh_keys_to_pod_pods__id__multiple_ssh_keys_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddMultipleSshKeysToPodRequest"];
            };
        };
        responses: {
            /** @description SSH keys added successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    set_no_interrupt_until_pods__id__no_interrupt_until_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NoInterruptWindowRequest"];
            };
        };
        responses: {
            /** @description Window set */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description In the past or beyond NO_INTERRUPT_WINDOW_MAX_HOURS */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The feature is off */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_price_change_alternatives_pods__id__price_change_alternatives_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Alternatives, possibly none */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PriceChangeAlternatives"];
                };
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    reboot_pod_pods__id__reboot_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RebootPodRequest"];
            };
        };
        responses: {
            /** @description Pod rebooted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_pod_run_record_pods__id__record_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Run record assembled */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PodRunRecord"];
                };
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    reset_pod_gpu_pods__id__reset_gpu_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ResetPodGpuRequest"];
            };
        };
        responses: {
            /** @description The reset started; poll its request_id */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResetPodGpuResponse"];
                };
            };
            /** @description invalid_gpu_index, pod_not_running */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description pod_broken, manual_rental, reset_not_supported, operation_in_progress */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description gpu_reset_unavailable: the validator cannot take the request now */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_pod_gpu_reset_pods__id__reset_gpu__request_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description running, done, failed or timeout */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResetPodGpuResponse"];
                };
            };
            /** @description Pod not found, or gpu_reset_not_found: no such request for this pod */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description gpu_reset_unavailable: the state cannot be read now; poll again */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    schedule_removal_pods__id__schedule_removal_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScheduleRemovalRequest"];
            };
        };
        responses: {
            /** @description Pod removal scheduled successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    delete_scheduled_removal_pods__id__schedule_removal_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Pod removal scheduled deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_pod_statement_pods__id__statement_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Statement assembled from the ledger */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PodStatement"];
                };
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    switch_template_pod_pods__id__switch_template_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SwitchTemplatePodRequest"];
            };
        };
        responses: {
            /** @description Pod switched template successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Pod"];
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found or template not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    trigger_backup_pod_pods__pod_id__backup_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pod_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManualBackupTriggerRequest"];
            };
        };
        responses: {
            /** @description Pod backed up successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_pod_feedback_pods__pod_id__feedback_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pod_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FeedbackRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeedbackResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pod_gpu_utilization_pods__pod_id__gpu_utilization_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pod_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description GPU utilization metrics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Not the caller's pod */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Failed to retrieve metrics */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    stream_container_logs_pods__pod_id__logs_get: {
        parameters: {
            query?: {
                follow?: boolean;
                tail?: number;
            };
            header?: never;
            path: {
                pod_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Log stream started successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description User not authorized */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Failed to stream logs */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    trigger_restore_pod_pods__pod_uuid__restore_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pod_uuid: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestoreRequest"];
            };
        };
        responses: {
            /** @description Restore process initiated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid input */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod or backup not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_restore_logs_for_pod_pods__pod_uuid__restore_logs_get: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path: {
                pod_uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Restore logs retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_RestoreLogResponse_"];
                };
            };
            /** @description The pod belongs to another account */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Pod not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    attribute_provider_referral_provider_referrals_attribute_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProviderReferralAttributeRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderReferralAttributeResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    record_provider_first_login_provider_referrals_first_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderReferralFirstLoginResponse"];
                };
            };
        };
    };
    request_provider_referral_payout_provider_referrals_payout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProviderReferralPayoutRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderReferralPayoutResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    provider_referral_summary_provider_referrals_summary_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderReferralSummaryResponse"];
                };
            };
        };
    };
    get_provider_statistics_provider_stats__miner_hotkey__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                miner_hotkey: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Provider statistics retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderStatisticsResponse-Input"];
                };
            };
            /** @description Provider not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_provider_executors_provider_stats__miner_hotkey__executors_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                miner_hotkey: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Nodes retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutorForProviderResponse-Input"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_provider_hotkeys_for_coldkey_provider_stats_coldkey__miner_coldkey__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                miner_coldkey: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Hotkeys found */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderHotkeysResponse"];
                };
            };
            /** @description Provider not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    launch_stats_public_v1_launch_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LaunchStatsResponse"];
                };
            };
        };
    };
    list_nodes_public_v1_nodes_get: {
        parameters: {
            query?: {
                /** @description Also list nodes that are on the market but rented now (available_now false). */
                include_rented?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NodesResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_requested_classes_public_v1_requests_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RequestsFeedResponse"];
                };
            };
            /** @description The demand feed is not enabled (MACHINE_REQUEST_NOTIFY_V2_ENABLED off) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_public_stats_public_v1_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicStatsResponse"];
                };
            };
        };
    };
    ready_ready_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ready */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Not ready; `failing` names why */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_referral_history_referrals_history_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReferralHistoryResponse"];
                };
            };
        };
    };
    get_my_referral_code_referrals_my_code_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReferralCodeResponse"];
                };
            };
        };
    };
    get_pending_payouts_referrals_pending_payouts_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PayoutResponse"][];
                };
            };
        };
    };
    get_referral_program_info_referrals_program_info_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReferralProgramInfoResponse"];
                };
            };
        };
    };
    get_referral_stats_referrals_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReferralStatsResponse"];
                };
            };
        };
    };
    validate_referral_code_referrals_validate__code__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ValidateReferralResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    withdraw_referral_rewards_referrals_withdraw_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WithdrawReferralRewardsResponse"];
                };
            };
        };
    };
    cancel_restore_restore_logs__restore_log_id__cancel_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                restore_log_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_restore_progress_restore_logs__restore_log_id__progress_put: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                restore_log_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestoreProgressUpdateRequest"];
            };
        };
        responses: {
            /** @description Restore progress updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid or expired authentication token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Restore log not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Restore operation is no longer active */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    find_my_ssh_keys_ssh_keys_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SshKey"][];
                };
            };
        };
    };
    register_ssh_key_ssh_keys_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSshKey"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SshKey"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    find_one_my_ssh_key_ssh_keys__id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SshKey"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_ssh_keys__id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSshKey"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SshKey"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_ssh_keys__id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SshKey"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    provider_payout_webhook_stablecoin_provider_payouts_webhook_post: {
        parameters: {
            query?: never;
            header?: {
                "x-webhook-signature"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    crypto_transfer_webhook_stablecoin_webhook_post: {
        parameters: {
            query?: never;
            header?: {
                "x-webhook-signature"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_connect_account_stripe_connect_account_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateConnectAccountRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_onboarding_link_stripe_connect_onboarding_link_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOnboardingLinkRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_supported_countries_stripe_connect_supported_countries_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    create_checkout_session_stripe_create_checkout_session_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCheckoutSessionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_invoice_stripe_invoices__invoice_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoice_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StripeInvoiceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_payment_methods_stripe_payments_payment_methods_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    add_payment_method_stripe_payments_payment_methods_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddCardRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_payment_method_stripe_payments_payment_methods__payment_method_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                payment_method_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    payment_method_three_d_secure_stripe_payments_payment_methods__payment_method_id__three_d_secure_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                payment_method_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    invoice_card_topup_stripe_transactions__transaction_id__invoice_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                transaction_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StripeInvoiceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    stripe_webhook_stripe_webhook_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    create_transfer_tao_create_transfer_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTransferRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateTransferResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    alpha_subnets_tao_pay_balance_alpha_subnets_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    convert_tao_pay_balance_convert_get: {
        parameters: {
            query: {
                amount: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    convert_alpha_tao_pay_balance_convert_alpha_get: {
        parameters: {
            query: {
                amount: number;
                netuid?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    generate_token_tao_pay_token_generate_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    verify_coldkey_signature_tao_pay_token_verify_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyWalletRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    potential_transfer_tao_pay_transfer_potential_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PotentialTransferRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_wallet_tao_pay_wallet__wallet_id___customer_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                customer_id: string;
                wallet_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    available_wallets_tao_pay_wallet_available_wallets__customer_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                customer_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    company_wallet_tao_pay_wallet_company__get: {
        parameters: {
            query?: {
                app_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    pending_transfers_tao_pay_wallet_pending_transfers__customer_id__get: {
        parameters: {
            query?: {
                hours?: number | null;
            };
            header?: never;
            path: {
                customer_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    webhook_tao_webhook_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    find_templates_templates_get: {
        parameters: {
            query?: {
                driver_version?: string | null;
                gpu_model?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TemplateResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_template_templates_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomTemplateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    find_one_template_templates__id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_template_templates__id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomTemplateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_template_templates__id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    check_template_templates_check_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TemplateCheckRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TemplateCheckIssue"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_invoice_tmc_pay_create_invoice_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TmcPayCreateInvoiceRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TmcPayCreateInvoiceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_currencies_tmc_pay_currencies_get: {
        parameters: {
            query?: {
                refresh?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TmcPayCurrenciesResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_invoices_tmc_pay_invoices_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TmcPayInvoicesResponse"];
                };
            };
        };
    };
    tmc_pay_webhook_tmc_pay_webhook_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_transactions_transactions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Transactions retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransactionResponse"][];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    signup_users_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateUserDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SignupResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_client_ip_endpoint_users_get_ip_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    login_users_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginUserDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    me_users_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    update_user_users_me_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_user_users_me_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_auto_top_up_users_me_auto_top_up_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutoTopUp"] | null;
                };
            };
        };
    };
    update_auto_top_up_users_me_auto_top_up_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AutoTopUpUpdateDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutoTopUp"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    turn_off_auto_top_up_users_me_auto_top_up_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    dismiss_auto_top_up_first_charge_notice_users_me_auto_top_up_first_charge_notice_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_billing_profile_users_me_billing_profile_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingProfileResponseDto"];
                };
            };
        };
    };
    update_billing_profile_users_me_billing_profile_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingProfileUpdateDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingProfileResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    disconnect_discord_users_me_discord_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    connect_discord_callback_users_me_discord_callback_get: {
        parameters: {
            query?: {
                code?: string | null;
                error?: string | null;
                state?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DiscordOAuthCallbackResponse"] | null;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_discord_oauth_url_users_me_discord_oauth_url_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DiscordOAuthAuthorizationUrlResponse"];
                };
            };
        };
    };
    get_events_users_me_events_get: {
        parameters: {
            query?: {
                api_key_id?: string | null;
                limit?: number;
                pod_id?: string | null;
                since?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PodEventResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_low_balance_threshold_users_me_low_balance_threshold_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EffectiveLowBalanceConfigDto"];
                };
            };
        };
    };
    update_low_balance_threshold_users_me_low_balance_threshold_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LowBalanceThresholdUpdateDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LowBalanceThreshold"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_low_balance_webhook_users_me_low_balance_webhook_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LowBalanceWebhookDto"];
                };
            };
        };
    };
    set_low_balance_webhook_users_me_low_balance_webhook_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LowBalanceWebhookUpdateDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LowBalanceWebhookDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_low_balance_webhook_users_me_low_balance_webhook_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_notification_setting_users_me_notification_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EffectiveNotificationSettingDto"];
                };
            };
        };
    };
    update_notification_setting_users_me_notification_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotificationSettingUpdateDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationSetting"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_user_preference_users_me_preference_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    clear_default_template_users_me_preference_default_template_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    update_referral_payout_method_users_me_referral_payout_method_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReferralPayoutMethodUpdateDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ensure_stripe_customer_users_me_stripe_customer_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
        };
    };
    get_transfer_credit_history_users_me_transfer_credit_history_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransferHistoryDto"][];
                };
            };
        };
    };
    transfer_credits_users_me_transfer_credits_post: {
        parameters: {
            query?: never;
            header?: {
                /** @description Makes a retry safe: the same key with the byte-identical body returns the first call's answer with `Idempotent-Replayed: true`, for a year after an answer that rented a pod and 24 h otherwise (for an older rental, check GET /pods before retrying); a stored 4xx (refusal) gives way to the same key with a corrected body; a different body after a stored 2xx is 422 `idempotency_key_reused`; a repeat while the first call runs is 409 `idempotency_in_progress`; a repeat of a call that may have rented but whose answer was not recorded is 409 `idempotency_outcome_unknown`, with no expiry. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransferCreditsDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_transfer_history_users_me_transfer_history_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransferHistoryDto"][];
                };
            };
        };
    };
    generate_presigned_url_users_presigned_url_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FileInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_reset_password_users_request_reset_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestResetPasswordDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    reset_password_users_reset_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    report_unknown_driver_v1_nvml_driver_report_unknown_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportUnknownDriverRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_referral_weights_v1_referral_weights_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_shared_config_v1_shared_config_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SharedConfig"];
                };
            };
            /** @description Unchanged since the ETag sent in If-None-Match */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_version_version_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_volumes_volumes_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of available volumes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VolumeResponse"][];
                };
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_volume_volumes_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VolumeCreateRequest"];
            };
        };
        responses: {
            /** @description Volume created successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VolumeResponse"];
                };
            };
            /** @description Volume limit reached */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The account has no completed paid deposit */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Too many volume creations */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_volume_volumes__volume_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                volume_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Volume retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VolumeResponse"];
                };
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Volume not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update_volume_volumes__volume_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                volume_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VolumeCreateRequest"];
            };
        };
        responses: {
            /** @description Volume updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VolumeResponse"];
                };
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Volume not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    delete_volume_volumes__volume_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                volume_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Volume deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Volume not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_current_volume_stats_volumes__volume_id__current_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                volume_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current stats retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Volume not found or access denied */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_volume_cost_summary_volumes_cost_summary_get: {
        parameters: {
            query: {
                /** @description End date in YYYY-MM-DD format */
                end_date: string;
                /** @description Start date in YYYY-MM-DD format */
                start_date: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Cost summary retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VolumeCostSummaryResponse"];
                };
            };
            /** @description Invalid query parameters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_volume_costs_volumes_costs_get: {
        parameters: {
            query: {
                cost_type?: string | null;
                end_date: string;
                group_by?: string | null;
                include_deleted?: boolean;
                limit?: number;
                page?: number;
                start_date: string;
                volume_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Volume costs retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VolumeCostsPaginatedResponse"];
                };
            };
            /** @description Invalid query parameters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden for this caller (API key scope or workspace membership) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    preview_invitation_workspace_invitations__token__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceInvitationPreviewResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    accept_invitation_workspace_invitations__token__accept_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceMemberResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_workspaces_workspaces_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceResponse"][];
                };
            };
        };
    };
    create_workspace_workspaces_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_workspace_workspaces__workspace_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_workspace_workspaces__workspace_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rename_workspace_workspaces__workspace_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceUpdateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    accept_billing_owner_workspaces__workspace_id__billing_owner_accept_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    transfer_billing_owner_workspaces__workspace_id__billing_owner_transfer_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingOwnerTransferRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    cancel_billing_owner_transfer_workspaces__workspace_id__billing_owner_transfer_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_workspace_events_workspaces__workspace_id__events_get: {
        parameters: {
            query?: {
                limit?: number;
                since?: string | null;
            };
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceEventResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_invitations_workspaces__workspace_id__invitations_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceInvitationResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    invite_workspaces__workspace_id__invitations_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceInvitationCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceInvitationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    revoke_invitation_workspaces__workspace_id__invitations__invitation_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invitation_id: string;
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_members_workspaces__workspace_id__members_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceMemberResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    add_member_workspaces__workspace_id__members_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceMemberAddRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceMemberResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_member_workspaces__workspace_id__members__member_user_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                member_user_id: string;
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    change_member_role_workspaces__workspace_id__members__member_user_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                member_user_id: string;
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceMemberRoleRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceMemberResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
