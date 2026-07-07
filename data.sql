SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict T9KyUbXqEUibufjoflJJE5xebrjmzU5bLl8rgSvRiHGiuMzi65R9T1my0CudA6H

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('a3e94c9b-3f37-4454-ad44-eb5bd9765c8e', NULL, 'a9df9e53-9d75-4c32-845a-2515fccad335', 's256', 'bkAxm4pk2EbVtc3SKOBiV6xVvYKSx5WQlABSfrb0cGA', 'google', '', '', '2026-05-09 12:39:24.816522+00', '2026-05-09 12:39:24.816522+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('c108d19a-8b2d-43e6-9105-e76e3a3614e8', 'cf48a333-b45a-43ed-98aa-4e05a63b8a21', 'fe5f4623-37d2-41a0-9371-224ec4ac1e35', 's256', 'pvTpCjYuYAQXzyBYw3Tgxxnb3EAIfaAgYrG66XA4--w', 'google', 'ya29.a0AQvPyIOhA2IBB_LyMrvdk1tZb7dHxDTaYfaAL6uX8i2HxCyP2YX1662O25jMYj9ZZacTTH_4FrKODjVA-zFku78AR-7Zfrp2X8W1onh67Udk63JVgPteV18QfROqhPICBuu_6BqIPIHt3bNrzMXFYPi0JtZC8s4Uu28Ch_ClhVSs09A70qSdClnCW_M6O3ULBiLRu78aCgYKAX8SARISFQHGX2Mi6Vo00CYmQLnz8oK-aLtMKA0206', '1//0g7pxFrVVkrwoCgYIARAAGBASNwF-L9IrBcyeI3Y9pcxYXlhaPrVXZ_YfA6JMJOQZTwP58sQHxizAO1ZCGnFXoa3hRPelZKyitsk', '2026-05-08 20:28:23.603399+00', '2026-05-08 20:28:32.49775+00', 'oauth', '2026-05-08 20:28:32.497695+00', NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('6954d566-8094-4a28-9f1a-7faef07da1e0', NULL, '10f44a7c-be31-4ad1-b922-276393c9193d', 's256', 'SfEWDBGkBtYpUHVX_VouAnRCPXbjZ_dzd0j02UY86B0', 'google', '', '', '2026-05-08 20:34:41.689405+00', '2026-05-08 20:34:41.689405+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('53d63fd6-6a03-44e6-a4d4-5874ed1fba6b', NULL, 'f2b070cf-dade-40b0-99b2-d33292178a45', 's256', 'K0_-ZigNsHSkc0ox5_TtYM6FL7o_GsBGcBh-HHvYEpY', 'google', '', '', '2026-05-08 20:41:35.18843+00', '2026-05-08 20:41:35.18843+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('f8df11ef-133b-4940-b861-d6631193f800', NULL, '6dc7caae-8953-41c1-a5b5-dedeb9e954e3', 's256', 'CaQW8Wj8r8tb6p3d1nFDkOCfVxmNPAcWmleCMVL3DKk', 'google', '', '', '2026-05-08 20:43:10.112379+00', '2026-05-08 20:43:10.112379+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('dbe9d39c-4f1a-4db9-b82a-402392609fc0', NULL, 'bd3231c4-4b0b-4f13-87f9-c74ed94b8bf6', 's256', 'NQ8acyD7sxfOHqEkHT3GUGh24diN8m2pJhDhOLystbs', 'google', '', '', '2026-05-08 20:47:53.115368+00', '2026-05-08 20:47:53.115368+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('83220c27-1001-4a6c-afa0-dc605160c732', NULL, '58ebb1a8-90a0-4d1b-bc19-9d4b30ba6d4f', 's256', 'n-atVfMmOitUO6gjP9dR3fWksCNF1DW3h7A0yQUN36A', 'google', '', '', '2026-05-08 20:48:34.023712+00', '2026-05-08 20:48:34.023712+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('d846cc92-efbb-4929-a9dd-4ac71c45719a', NULL, '73b5b00b-cd72-47ab-a857-959ed1d968eb', 's256', 'FCVqC9sjN2M6jf_ahMcMjKmD_GCzlZxhEEf3ZUV8H_w', 'google', '', '', '2026-05-08 20:50:53.741161+00', '2026-05-08 20:50:53.741161+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('0927ab27-fc9b-4206-96c4-f424d8e5e8c9', NULL, 'b04e5353-53e2-44f1-9f7c-32695dd1b653', 's256', 'A_7Z-twh5jXurBBXxwEYHVxcZopkWUoeJTRiL1EfqUM', 'google', '', '', '2026-05-08 20:52:03.791356+00', '2026-05-08 20:52:03.791356+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('7fdac241-b05b-4bf0-b425-f07d5064f72b', NULL, '84fe9a62-3536-4215-a8f5-dd3c57fa2072', 's256', '-Jk8MQgj3j2O7Xovf5intaLh2OVrxs0AeJf_n7wK3vw', 'google', '', '', '2026-05-08 20:52:12.170155+00', '2026-05-08 20:52:12.170155+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('4cbbe818-8ab5-4637-9005-12a4ce17e1dd', NULL, '8bb40497-7837-4e9d-a3c6-57faca12df22', 's256', 'PzXVawryiLnzz2uL0_WYEV9iVqRK3enynnHz4yPh5u0', 'google', '', '', '2026-05-08 20:54:51.752255+00', '2026-05-08 20:54:51.752255+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('f736255a-1bd6-4f29-9b3e-673ca1b80b6f', NULL, 'b07b9e23-39ce-48b8-9d90-ba7e3082031b', 's256', 'ENcfcfCwtDcnCJQu_hkweRpOJeNu4XNCsgU7Q2oe9lI', 'google', '', '', '2026-05-08 20:57:34.018461+00', '2026-05-08 20:57:34.018461+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('1eb5e9fc-8540-4f20-9add-a7a6262b22ff', 'e8edf3fc-89ad-4928-ab5e-42d82ec74980', '84bf1c63-12a1-4445-8bf5-438ed88d041c', 's256', 'AtdCtJpvIT0mOldl4rPOwCXb9JhgfauVwvd7-uD5-RM', 'google', 'ya29.a0AQvPyIMLCIqIp1ewkmDSANYEF78vblNAIPt6JrzqRJe3VG9xqaTtFHoMdeeuTBkyc-sL-qWE9I_kSsCPQrfl1rQjbroMPKibJnpqMuV4qWR1oWZ0on13BalaiM8WBIlyg0J3K5dbdDWBIw6ii-Si1dYz19DdeAU8B6bXV9Q7IEn64OICZiTHFCwED4GDSRn2hmldV6YaCgYKAbASARISFQHGX2MipCdZZHwF_Gr4VMZS5qqg3A0206', '', '2026-05-09 17:53:55.580117+00', '2026-05-09 17:54:03.250185+00', 'oauth', '2026-05-09 17:54:03.250135+00', NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('15dd159b-3dfa-4cee-8968-7759561023f9', NULL, '7c206aca-bc91-42dd-b8af-33083a2878c1', 's256', 'BOdbdOVRY8_DXVxli_G3sDTLaUUJQfY1cAG4PknDqHA', 'google', '', '', '2026-05-08 21:30:51.265258+00', '2026-05-08 21:30:51.265258+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('c1a0fec4-d55f-4592-92fe-e5b5d0d1f780', NULL, 'de95afc7-8d96-4f14-bd3b-d2667fade34f', 's256', 'xfK30aSE2UXxoI0qXCyqIVXRdDXMz-wCw-2QDnIOoiI', 'google', '', '', '2026-05-09 18:01:53.429844+00', '2026-05-09 18:01:53.429844+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('2e5d61d1-ca7e-41e1-88ce-39b85c9c878c', NULL, '7e0ed433-38d4-4e4d-b01e-7cf1e279dcff', 's256', '_vman_aATAj7noGMhegOLbWS5v6s-5j6g_y-wydgljM', 'google', '', '', '2026-05-09 20:20:13.904737+00', '2026-05-09 20:20:13.904737+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('3d616236-684e-4d04-b99b-333242fa9844', NULL, '7f262b2f-3140-4e4b-8b2d-432ace427edf', 's256', 'oLvXDxakhKsX-KOReR4iTRkxNXTUwnnJ3OiWEhELn1U', 'google', '', '', '2026-05-08 21:46:59.103118+00', '2026-05-08 21:46:59.103118+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('3729e0ac-c758-4de6-9088-6a823e6f89ae', NULL, 'faf1138f-27b3-4c90-ae3a-d1cc90d93d77', 's256', 'C-skRA2fG8zjOcTovi4p5XNcFoHRpWEyF6b2y8cm8eA', 'google', '', '', '2026-05-08 21:47:30.601913+00', '2026-05-08 21:47:30.601913+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('77b12dc1-9c9c-4bf7-9d95-ad3839fc84c4', NULL, '625bed22-98c0-45dd-a3ec-c862a5ccddc9', 's256', '4WAu7JswgvSnyGo--N3b611tZMhTcxZYNO_H96L76h0', 'google', '', '', '2026-05-08 21:50:16.005752+00', '2026-05-08 21:50:16.005752+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('398d52f5-2b1c-4a45-9605-0f7e7977c308', NULL, '11bcee62-e54f-4b23-8a0e-cda169ceeeea', 's256', '7JiVI9WwPlqIOfs5aO6H1uTSUaUUoI94xajDFMMSId4', 'google', '', '', '2026-05-09 20:31:41.594055+00', '2026-05-09 20:31:41.594055+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('74d9c35a-2cc3-4203-96fb-a462c1f455c8', NULL, '9463645e-a6ea-48cf-9bf9-ff81b8a365ac', 's256', '5ADwZekAh150cuS-2CsF3UwkTAdE5dRxHSwf9lxA3GQ', 'google', '', '', '2026-05-08 22:34:00.279954+00', '2026-05-08 22:34:00.279954+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('fbc5bb9e-ea4f-4644-9182-a12e7f1f5296', 'bc16bfd1-4611-4d4c-b5b2-cd0c30449f2c', '57b89b81-c5fe-4215-857a-01112eee8d2e', 's256', 'FUOyN-vac-K2dTw9QlA8AEgJC-WFxe0_fAAI-LJ3Vx8', 'magiclink', '', '', '2026-05-10 11:31:48.135683+00', '2026-05-10 11:32:13.664204+00', 'magiclink', '2026-05-10 11:32:13.664049+00', NULL, NULL, NULL, NULL, false),
	('a15534b2-e29d-4d57-a660-4900e5f53e54', 'b932f923-d6e7-4bfd-a764-c8c78bf8ac91', '65295624-3158-470c-95d3-abc959b0eaa3', 's256', 'BYJDbOsnOtu7F6_1T269Rwnf6a6HhmADdBqXIgmpRMc', 'google', 'ya29.a0AQvPyIMjdxGTjTVSCpSfgUQ0sfWjShhzR_hGqfsswyYELFsmjaComBTjWo3X39AZarubNaVSp79aGkiCZlEa1_qSy8LiOHSYNiWMXZAHkg16xiXBrOxRrr9KVAYjCGeqSlo8p4sWpo7Ft85iWsEFQN3K9pJFzndf4_CcfVoFPfmYlhVbk_TA-z9DvasR2UoAbGKflhIaCgYKAQkSARcSFQHGX2MisIYdgMmHsDDjjN7dmHjL5g0206', '', '2026-05-11 20:47:11.19124+00', '2026-05-11 20:47:20.872389+00', 'oauth', '2026-05-11 20:47:20.872336+00', NULL, 'http://localhost:3000', NULL, NULL, false),
	('388be801-177c-4a60-88b8-d2818e14bfa8', 'b932f923-d6e7-4bfd-a764-c8c78bf8ac91', '261fc004-6101-4606-a93b-57a7949af39b', 's256', 'WsG--U8_6fAJUOAjrV4ggnMS8R3_88x41qKAW4ovmiI', 'google', 'ya29.a0AQvPyIMnmRFSV562JMcRmpgYBDBufn-UBTG0FyUB2BR78brZcLRAPBhgdeN_1HWZPIktGaD6uaP-7bsRTp18ti5MFm6czYvj5gxj_iKzX6w73kUQPTHOUNmdgEqU2mUa2aDQi-wnBxfRJyJ-02ztkvGe8Ul9NDS9a9p0bHp2t_v5XqfDVrn4eT0UFfdvE_ZDbYtiFO74mfuzIRMz66ykJs6_51Rn6ZQAiiZ3RZW-mIilTPuTtjeEi8hU_uzRys_qaYSFoqiyPys59APGVPHdB14xaCgYKASgSARcSFQHGX2Miytp8vmCnscbRlye1ylgtcg0287', '', '2026-05-11 20:48:53.908065+00', '2026-05-11 20:48:54.548265+00', 'oauth', '2026-05-11 20:48:54.548181+00', NULL, 'http://localhost:3000', NULL, NULL, false),
	('7bf1bf43-8809-4dda-a3f1-1d86f2b2b9e5', NULL, 'bccf9fc0-8571-45f9-857b-f549ccbe0b17', 's256', 'h47hbmtRITe0Ira_x2p4-D1I1cleBVbKw3GR2CP9Z2I', 'google', '', '', '2026-05-21 08:44:09.27642+00', '2026-05-21 08:44:09.27642+00', 'oauth', NULL, NULL, 'http://localhost:3000', NULL, NULL, false),
	('eb1c7a9e-bdbe-4f77-9458-994731ea8644', 'b54d372f-23ce-4fe6-9cd9-76cbfef97b8f', '53be824b-c458-4f63-b112-f112652d4e70', 's256', 'K37Q38MCwP00KHp_0J4uc3J2q7E5xz_fbDOUivc_5Hs', 'google', 'ya29.a0AQvPyIPRSIs4_5mDjNNeWTV7QwHNO2boFTTRathyQHX3-P_G_NYx7VJF-pgTkr8riivvfpeXV4o_FKXld1dLFhL0m9B5QwciPKFssS-xw9fNB5xn-BVqcUga2bbA8NYVKImiRKfDe2Xw5x0n6zLn0QXP7kG_v5V0VBPIj4rHQdXyfhlMoaRXV8SOQL74Nyq5WvFaxCPnPv7AMJGoPkz1Gdpwx5lEkIndrzVjJtsx9PTfTCU2msT2jVHdxhqzcDszDMAX4FK2UjFCOb0BLxBmrshKPWNOaCgYKAecSARISFQHGX2Mi4UGwZ84SOQJ1QSDXrkmqzA0291', '', '2026-05-21 08:47:53.484133+00', '2026-05-21 08:48:07.368914+00', 'oauth', '2026-05-21 08:48:07.368861+00', NULL, 'http://localhost:3000', NULL, NULL, false),
	('c28e8bc0-9218-4765-98bc-752c83ad50a0', NULL, '309ef66f-c43a-40a2-8d0f-b98b9dd740b3', 's256', 'zi1O3QLrOyXi1o8-pXnydxnGvXnNlQKx-jUxnKLAbcY', 'google', '', '', '2026-05-21 10:47:37.707427+00', '2026-05-21 10:47:37.707427+00', 'oauth', NULL, NULL, 'http://localhost:3000', NULL, NULL, false),
	('2be1bded-62bf-4ce9-b410-818f1310656c', NULL, '32036a37-38d4-408a-beb7-7f0a56598b65', 's256', '_ol9plcJg19jxI7d4Kr15MuirkTVHLQ7bKr-JTSl3ak', 'google', '', '', '2026-05-21 12:12:10.353682+00', '2026-05-21 12:12:10.353682+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('bfe6e313-407e-4b9d-8861-d0a40b2b735f', NULL, 'd74c0d1c-9b96-466b-a4fc-936701452140', 's256', 'zB8im4z-2WrJNVkSfFBUuuUnP66kS6_hHKkjTV6-iOk', 'google', '', '', '2026-05-21 12:16:38.102323+00', '2026-05-21 12:16:38.102323+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('06678af6-0aee-4104-98fe-d97a706b2a18', NULL, '3256be65-71e4-4c42-81c0-e216ae090321', 's256', '2dq3eRbqXHR-xCTq3Oegnn-mJMPJ2pOEtHPVSzjTR54', 'google', '', '', '2026-05-21 13:13:55.190773+00', '2026-05-21 13:13:55.190773+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('ae668f06-333c-4f9d-b82f-7dd9c6f3810d', NULL, '4d56d342-d9de-4549-a279-6f618a04f874', 's256', 'RaqlE2RrHIywSOye2whdfcI_hPXuiJrhk0fY6xHDa9o', 'google', '', '', '2026-05-22 14:17:10.961294+00', '2026-05-22 14:17:10.961294+00', 'oauth', NULL, NULL, 'http://localhost:3000', NULL, NULL, false),
	('8d54dafe-f83a-4529-b73a-4513b88de0e0', NULL, '8eeca72e-6a73-4f3a-8bc3-246b328f9c4d', 's256', 'Md8UW2kqcFjwabVC8QdiubHmCdQQQkc31jGQ39gxRdg', 'google', '', '', '2026-05-24 11:16:02.214027+00', '2026-05-24 11:16:02.214027+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('6132c2c4-52a6-429c-8fa4-e6e926e46850', '3b83c02d-5451-4c03-9707-7c4705926722', '13d5ed25-23dc-4ad0-8501-bbb098f4c4ad', 's256', 'UPWVkpcdkmwORUPOAGb4_JSDk1ubfMsvZZN4477M9jM', 'google', 'ya29.a0AQvPyIP9eg319WgnmLzfpuWwrzWA_b5eci2bsteVLFJP-IJBWeFJ7tjKj2Rej8-SdahLkQrnki_tGi-tExAKbIFJr0_XCBNJh_QHCI2E1axBqIIj48XCyYwW4ot9d29kjSVybQx8cPYl3bCOthJ_fXdGDbWOaN3bPn1WhiSSEsSsqAoP520tVtwG1l1D1KCdsOYOZCwLAIlAg33Fs9eM7DXuszcBcC2ZShw-WXqj5YUc3fAxKzkoCXI-bjdTM5PKW1BbsPdQIzq8vA2NlAgCm65tVgF9wgaCgYKAUgSARISFQHGX2MiS1OTI7D_AzZzDX0pmwCDnA0293', '', '2026-05-24 11:19:40.372551+00', '2026-05-24 11:19:44.127249+00', 'oauth', '2026-05-24 11:19:44.127196+00', NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('b9a95561-3db2-4c4b-bab9-916909580491', '84ac9604-af6e-4f5b-9869-8a29c7933c78', '5907bb09-87cc-4df7-ad3a-08b6942a1e4e', 's256', 'FcqlQP6l4qg3ODwgHqW2OcGHI2fipxquC49SvG8HS0U', 'google', 'ya29.a0AQvPyIPu9YHsa9Ui8k5LufRyWrvY3UGsKIYc0O1zD5lAVLik6NtkyU3Hy2RIF_017uHz3VQfaVD4S2_HApADr8Z6jOAXCN6--HcTvL0RbRSeDI2RlfBEiAPdLeaal_vgi8TzDhdYz6j-34L3_q7mJ_dEZJ4gqDM8Vt9egs4rto1OVuy7toNEgz6zldLadS8DY5DZHynZFa36PQl-59DsjokfmAFSAS9z2eQWLchNiMOctJzirF3Kn8wkkdoguaPrR660wE3vTltiVwom1FUZ-TyWx-RwaCgYKAS8SARISFQHGX2Mimh38wBbf4jX_uo5Ga7UhnA0291', '', '2026-05-24 11:20:33.790887+00', '2026-05-24 11:20:37.426574+00', 'oauth', '2026-05-24 11:20:37.426486+00', NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('04d501e7-49bb-46ff-8faf-9a7d43fbb7e3', NULL, '3260d575-482d-4d4a-9d88-de103416fe27', 's256', 'a3SWqHKgckgkltnnggAR-5iN0lpOS79ZxhwKiy0eIlY', 'google', '', '', '2026-05-24 21:01:43.154905+00', '2026-05-24 21:01:43.154905+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('91d6bb83-61c5-46c3-ada9-b1589d1c2bd1', NULL, 'e8e1c021-a2cf-48fd-be67-37399c659bed', 's256', 'R5jkhmpgOr_Q6ZvVyNkv8EKdITVvhFbDsBq40iptjfk', 'google', '', '', '2026-05-25 08:46:36.454669+00', '2026-05-25 08:46:36.454669+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false),
	('45a4c711-d723-4a1f-ae7e-c21ea6556f90', NULL, '98ced702-ec5b-492b-a20c-f214c7ebd7fa', 's256', 'JxmKhZBTr1FmkQZ-5FdqehuJnT9r0uwFcc4iv9Nm_og', 'google', '', '', '2026-06-21 15:52:52.123664+00', '2026-06-21 15:52:52.123664+00', 'oauth', NULL, NULL, 'http://localhost:3000/auth/callback', NULL, NULL, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '2fbe83f2-fe59-4426-bc5f-db40be9564df', 'authenticated', 'authenticated', 'saleemsaim3@gmail.com', NULL, '2026-05-26 16:54:08.698776+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-05-26 17:59:08.053425+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "117119245623013245327", "name": "Vex Plays Games", "email": "saleemsaim3@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocL_ZrFfJCBQAqmfLk7E9KThPqKxLkKD-3W5KBWK4GodNAVDrZ4j=s96-c", "full_name": "Vex Plays Games", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocL_ZrFfJCBQAqmfLk7E9KThPqKxLkKD-3W5KBWK4GodNAVDrZ4j=s96-c", "provider_id": "117119245623013245327", "email_verified": true, "phone_verified": false}', NULL, '2026-05-26 16:54:08.678476+00', '2026-06-18 11:13:12.861754+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1f1d4417-843b-4ef3-ace3-919bdbebc1ef', 'authenticated', 'authenticated', 'musa@gmail.com', '$2a$10$bVpi.agluzfZDwMC.7ZxMutnnzOYQplP/m0WnWqE1Y9wYPv9N7bfS', '2026-06-05 21:33:59.495954+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-05 21:34:45.793125+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "1f1d4417-843b-4ef3-ace3-919bdbebc1ef", "email": "musa@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-06-05 21:33:59.446748+00', '2026-06-05 21:34:45.809067+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1d590522-9965-475d-9a90-cd1fefd2f169', 'authenticated', 'authenticated', 'saim@gmail.com', '$2a$10$rs.Zo3BosX/c7Xu675huWemIaYZylm.dQy0o8ql3Jk0ePRWNFp1/W', '2026-05-31 19:00:39.410763+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-18 11:16:58.551629+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "1d590522-9965-475d-9a90-cd1fefd2f169", "email": "saim@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-05-31 19:00:39.364591+00', '2026-07-03 06:33:13.906391+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', 'authenticated', 'authenticated', 'vex@gmail.com', '$2a$10$XUmXa0oE7bsv8awHPdz5NeWnB8v1H0Z12EG/0A3HM0/11Ov2o4zxy', '2026-06-21 15:53:47.341325+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-21 15:54:04.341678+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d0dd2297-a4e1-4769-ac11-43ef569adcb1", "email": "vex@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-06-21 15:53:47.291838+00', '2026-06-21 17:51:12.65543+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '40c84058-ccf2-4d82-ae12-6ee82db8362c', 'authenticated', 'authenticated', 'vexplaysgames786@gmail.com', NULL, '2026-05-24 20:49:10.74844+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-05-26 17:58:54.546211+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "112867164465598990037", "name": "Vex", "email": "vexplaysgames786@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJwh9YSooDgznXSCSguKkWcDha4hDUaC5NDdgAWs3Ks0z-8fEag=s96-c", "full_name": "Vex", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJwh9YSooDgznXSCSguKkWcDha4hDUaC5NDdgAWs3Ks0z-8fEag=s96-c", "provider_id": "112867164465598990037", "email_verified": true, "phone_verified": false}', NULL, '2026-05-24 20:49:10.716964+00', '2026-05-26 17:58:54.552267+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('1d590522-9965-475d-9a90-cd1fefd2f169', '1d590522-9965-475d-9a90-cd1fefd2f169', '{"sub": "1d590522-9965-475d-9a90-cd1fefd2f169", "email": "saim@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-05-31 19:00:39.397022+00', '2026-05-31 19:00:39.397073+00', '2026-05-31 19:00:39.397073+00', '6c160af7-34d6-4008-ab0d-a5b48f63707e'),
	('1f1d4417-843b-4ef3-ace3-919bdbebc1ef', '1f1d4417-843b-4ef3-ace3-919bdbebc1ef', '{"sub": "1f1d4417-843b-4ef3-ace3-919bdbebc1ef", "email": "musa@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-06-05 21:33:59.487185+00', '2026-06-05 21:33:59.487235+00', '2026-06-05 21:33:59.487235+00', '5bf23b6a-70f8-4d1d-afec-95fd7a40a149'),
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '{"sub": "d0dd2297-a4e1-4769-ac11-43ef569adcb1", "email": "vex@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-06-21 15:53:47.331736+00', '2026-06-21 15:53:47.331793+00', '2026-06-21 15:53:47.331793+00', 'dfaf8d2f-ffc2-43a5-ae62-c48a09b026af'),
	('112867164465598990037', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '{"iss": "https://accounts.google.com", "sub": "112867164465598990037", "name": "Vex", "email": "vexplaysgames786@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJwh9YSooDgznXSCSguKkWcDha4hDUaC5NDdgAWs3Ks0z-8fEag=s96-c", "full_name": "Vex", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJwh9YSooDgznXSCSguKkWcDha4hDUaC5NDdgAWs3Ks0z-8fEag=s96-c", "provider_id": "112867164465598990037", "email_verified": true, "phone_verified": false}', 'google', '2026-05-24 20:49:10.738378+00', '2026-05-24 20:49:10.738428+00', '2026-05-26 17:58:54.112743+00', '3cdf0553-923e-41d2-8dec-e9da27fc3a6f'),
	('117119245623013245327', '2fbe83f2-fe59-4426-bc5f-db40be9564df', '{"iss": "https://accounts.google.com", "sub": "117119245623013245327", "name": "Vex Plays Games", "email": "saleemsaim3@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocL_ZrFfJCBQAqmfLk7E9KThPqKxLkKD-3W5KBWK4GodNAVDrZ4j=s96-c", "full_name": "Vex Plays Games", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocL_ZrFfJCBQAqmfLk7E9KThPqKxLkKD-3W5KBWK4GodNAVDrZ4j=s96-c", "provider_id": "117119245623013245327", "email_verified": true, "phone_verified": false}', 'google', '2026-05-26 16:54:08.690646+00', '2026-05-26 16:54:08.690698+00', '2026-05-26 17:59:07.720921+00', '8bb60871-1d2b-453d-a23c-2c3266a10131');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('6221489d-831d-47b5-ab8b-0aeea34402d0', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '2026-06-21 15:53:47.353213+00', '2026-06-21 15:53:47.353213+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '103.232.142.95', NULL, NULL, NULL, NULL, NULL),
	('f57a662e-f910-4aca-a052-8ea24b0a06ee', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '2026-06-21 15:54:04.341767+00', '2026-06-21 17:51:12.66343+00', NULL, 'aal1', NULL, '2026-06-21 17:51:12.663334', 'node', '103.232.142.94', NULL, NULL, NULL, NULL, NULL),
	('4a408244-1712-4b6d-a39c-2fc1fdee0be2', '1f1d4417-843b-4ef3-ace3-919bdbebc1ef', '2026-06-05 21:33:59.511661+00', '2026-06-05 21:33:59.511661+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '103.232.142.98', NULL, NULL, NULL, NULL, NULL),
	('5bf277e2-85c1-4058-a724-40af7834c8f0', '1f1d4417-843b-4ef3-ace3-919bdbebc1ef', '2026-06-05 21:34:45.794544+00', '2026-06-05 21:34:45.794544+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '103.232.142.98', NULL, NULL, NULL, NULL, NULL),
	('5b41b205-02ab-4cba-81fa-932d3664a0b1', '1d590522-9965-475d-9a90-cd1fefd2f169', '2026-06-18 11:16:58.554235+00', '2026-07-03 06:33:13.934006+00', NULL, 'aal1', NULL, '2026-07-03 06:33:13.933866', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '103.232.142.91', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('4a408244-1712-4b6d-a39c-2fc1fdee0be2', '2026-06-05 21:33:59.531182+00', '2026-06-05 21:33:59.531182+00', 'password', '26be537f-2853-4a2b-baa2-f58b88570e0d'),
	('5bf277e2-85c1-4058-a724-40af7834c8f0', '2026-06-05 21:34:45.811899+00', '2026-06-05 21:34:45.811899+00', 'password', '5fe58d57-2f3d-4368-868f-2850c520376d'),
	('5b41b205-02ab-4cba-81fa-932d3664a0b1', '2026-06-18 11:16:58.582024+00', '2026-06-18 11:16:58.582024+00', 'password', '1f9ddce8-3337-4602-af99-daf66ad3d543'),
	('6221489d-831d-47b5-ab8b-0aeea34402d0', '2026-06-21 15:53:47.389469+00', '2026-06-21 15:53:47.389469+00', 'password', '57aa5afc-c86c-4e19-83ee-2240ac7a12cc'),
	('f57a662e-f910-4aca-a052-8ea24b0a06ee', '2026-06-21 15:54:04.346439+00', '2026-06-21 15:54:04.346439+00', 'password', '11a14079-75e9-49af-947d-e993c1f4d2f2');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 182, '3z3tb7moc6mo', '1f1d4417-843b-4ef3-ace3-919bdbebc1ef', false, '2026-06-05 21:33:59.521157+00', '2026-06-05 21:33:59.521157+00', NULL, '4a408244-1712-4b6d-a39c-2fc1fdee0be2'),
	('00000000-0000-0000-0000-000000000000', 183, '3v3a3pj24a7l', '1f1d4417-843b-4ef3-ace3-919bdbebc1ef', false, '2026-06-05 21:34:45.80675+00', '2026-06-05 21:34:45.80675+00', NULL, '5bf277e2-85c1-4058-a724-40af7834c8f0'),
	('00000000-0000-0000-0000-000000000000', 189, 'obpt4zv4e6br', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-18 11:16:58.566243+00', '2026-06-18 12:16:03.107691+00', NULL, '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 190, 'imwhdy2rvduc', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-18 12:16:03.117789+00', '2026-06-21 06:48:28.086208+00', 'obpt4zv4e6br', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 191, 'mqyyhtk2gmqi', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-21 06:48:28.102583+00', '2026-06-21 07:47:51.353721+00', 'imwhdy2rvduc', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 192, '62xvrdoxxfvs', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-21 07:47:51.365718+00', '2026-06-21 08:58:01.440669+00', 'mqyyhtk2gmqi', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 193, 'yjvkxkpwq6ug', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-21 08:58:01.450002+00', '2026-06-21 13:54:14.846477+00', '62xvrdoxxfvs', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 194, 'v6ydjmedoza5', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-21 13:54:14.861055+00', '2026-06-21 14:59:16.604694+00', 'yjvkxkpwq6ug', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 196, '2g5d44yfiwtn', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', false, '2026-06-21 15:53:47.361895+00', '2026-06-21 15:53:47.361895+00', NULL, '6221489d-831d-47b5-ab8b-0aeea34402d0'),
	('00000000-0000-0000-0000-000000000000', 195, 'xfcdwcdwi5kh', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-21 14:59:16.617207+00', '2026-06-21 15:58:48.818808+00', 'v6ydjmedoza5', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 197, 'r632dotff7bo', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', true, '2026-06-21 15:54:04.344149+00', '2026-06-21 16:52:35.535314+00', NULL, 'f57a662e-f910-4aca-a052-8ea24b0a06ee'),
	('00000000-0000-0000-0000-000000000000', 198, '23qd34m2cnci', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-21 15:58:48.828537+00', '2026-06-21 16:59:25.689858+00', 'xfcdwcdwi5kh', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 199, 'c4ojmdpdcpmt', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', true, '2026-06-21 16:52:35.545375+00', '2026-06-21 17:51:12.632955+00', 'r632dotff7bo', 'f57a662e-f910-4aca-a052-8ea24b0a06ee'),
	('00000000-0000-0000-0000-000000000000', 201, 'zd7ucsy7qoj2', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', false, '2026-06-21 17:51:12.646387+00', '2026-06-21 17:51:12.646387+00', 'c4ojmdpdcpmt', 'f57a662e-f910-4aca-a052-8ea24b0a06ee'),
	('00000000-0000-0000-0000-000000000000', 200, 'whnnuzduaz3f', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-21 16:59:25.69542+00', '2026-06-23 08:48:13.142687+00', '23qd34m2cnci', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 202, 'b5ugex25olmh', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 08:48:13.165198+00', '2026-06-23 09:47:03.170366+00', 'whnnuzduaz3f', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 203, '3ddc6mon55tb', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 09:47:03.186233+00', '2026-06-23 11:07:00.70645+00', 'b5ugex25olmh', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 204, 'awfwozfhw7cf', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 11:07:00.721226+00', '2026-06-23 12:08:31.124389+00', '3ddc6mon55tb', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 205, 'bg3z3kbvq46o', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 12:08:31.134221+00', '2026-06-23 14:07:06.881465+00', 'awfwozfhw7cf', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 206, 'yv4hpjlmzrwa', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 14:07:06.890491+00', '2026-06-23 19:28:50.583314+00', 'bg3z3kbvq46o', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 207, '4hct5g2qi4cd', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 19:28:50.595075+00', '2026-06-23 20:27:41.215609+00', 'yv4hpjlmzrwa', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 208, 'edi25pwnqktt', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 20:27:41.239464+00', '2026-06-23 21:26:12.784528+00', '4hct5g2qi4cd', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 209, '252dvufwrslw', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-23 21:26:12.798808+00', '2026-06-29 21:19:14.276957+00', 'edi25pwnqktt', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 210, '3ijhssju2agk', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-29 21:19:14.29535+00', '2026-06-29 22:18:53.473124+00', '252dvufwrslw', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 211, 'gfev2z7plio2', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-29 22:18:53.482827+00', '2026-06-30 17:37:40.292976+00', '3ijhssju2agk', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 212, 'ekf25ud3wbtq', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-30 17:37:40.311416+00', '2026-06-30 19:14:15.239323+00', 'gfev2z7plio2', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 213, 'v3on7l4lwtih', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-30 19:14:15.253505+00', '2026-06-30 20:15:15.59877+00', 'ekf25ud3wbtq', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 214, '4mkmn77jwv4j', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-30 20:15:15.613573+00', '2026-06-30 22:41:45.813771+00', 'v3on7l4lwtih', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 215, 'farptaiiocs3', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-06-30 22:41:45.830192+00', '2026-07-01 04:29:42.550452+00', '4mkmn77jwv4j', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 216, '3ikizrokfa2a', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-07-01 04:29:42.572056+00', '2026-07-01 09:46:38.054087+00', 'farptaiiocs3', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 217, 'pqug67nutboi', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-07-01 09:46:38.071692+00', '2026-07-02 09:05:24.848461+00', '3ikizrokfa2a', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 218, 'z2czl74t7cr3', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-07-02 09:05:24.873455+00', '2026-07-02 13:48:16.116902+00', 'pqug67nutboi', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 219, 'dzkh5szekpid', '1d590522-9965-475d-9a90-cd1fefd2f169', true, '2026-07-02 13:48:16.12497+00', '2026-07-03 06:33:13.882825+00', 'z2czl74t7cr3', '5b41b205-02ab-4cba-81fa-932d3664a0b1'),
	('00000000-0000-0000-0000-000000000000', 220, 'ximh3fwl5oqs', '1d590522-9965-475d-9a90-cd1fefd2f169', false, '2026-07-03 06:33:13.897226+00', '2026-07-03 06:33:13.897226+00', 'dzkh5szekpid', '5b41b205-02ab-4cba-81fa-932d3664a0b1');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."institutions" ("id", "name", "created_at") VALUES
	('88c54dde-f4f9-4f96-adb1-3cbe3355446b', 'sdada', '2026-05-09 20:13:29.517709+00'),
	('bc1fa42c-92ed-4b25-a756-a308049df543', 'TUF', '2026-05-09 20:22:46.973373+00'),
	('5e103ee0-98b7-4983-9865-5f31f99e7a00', 'TFU', '2026-05-10 10:03:19.409027+00'),
	('37c6937e-c2fc-4e2b-9ff9-a6133a6ae7cb', 'The University of Faisalabad', '2026-05-24 11:18:21.373529+00'),
	('84c2e5ce-93a6-4c0e-ae56-a31575b8ca63', 'Abdul Islam College', '2026-05-25 18:55:54.208041+00'),
	('5d61bb8b-776b-4bcb-89af-d2a0511ff131', 'Riphah', '2026-06-05 21:34:42.648181+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "institution_id", "full_name", "email", "role", "avatar_url", "avatar_initials", "created_at", "last_login_at", "department", "primary_subject", "class_size", "grade_level", "student_id", "subject", "connected_google", "two_factor_enabled", "two_factor_method", "email_notifications", "push_notifications", "sms_alerts", "profile_visibility", "dark_mode", "language", "connected_microsoft", "password_last_changed_at") VALUES
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', 'bc1fa42c-92ed-4b25-a756-a308049df543', 'Vex Harbringer', 'vex@gmail.com', 'student', NULL, 'VH', '2026-06-21 15:53:47.288674+00', NULL, NULL, NULL, NULL, 'SEM 8', '2022-BS-SE-132', NULL, false, false, 'email', true, true, false, 'public', 'light', 'en-us', false, NULL),
	('40c84058-ccf2-4d82-ae12-6ee82db8362c', '37c6937e-c2fc-4e2b-9ff9-a6133a6ae7cb', 'Vex', 'vexplaysgames786@gmail.com', 'student', 'https://lh3.googleusercontent.com/a/ACg8ocJwh9YSooDgznXSCSguKkWcDha4hDUaC5NDdgAWs3Ks0z-8fEag=s96-c', 'V', '2026-05-24 20:49:10.685718+00', NULL, NULL, NULL, NULL, 'SEM 8', '2022-BS-SE-132', NULL, true, false, 'email', true, true, false, 'public', 'light', 'en-us', false, NULL),
	('1f1d4417-843b-4ef3-ace3-919bdbebc1ef', '5d61bb8b-776b-4bcb-89af-d2a0511ff131', 'Musa Nayyer', 'musa@gmail.com', 'student', NULL, 'MN', '2026-06-05 21:33:59.445542+00', NULL, NULL, NULL, NULL, 'SEM 8', '24481', NULL, false, false, 'email', true, true, false, 'public', 'light', 'en-us', false, NULL),
	('2fbe83f2-fe59-4426-bc5f-db40be9564df', 'bc1fa42c-92ed-4b25-a756-a308049df543', 'Vex Plays Games', 'saleemsaim3@gmail.com', 'teacher', 'https://lh3.googleusercontent.com/a/ACg8ocL_ZrFfJCBQAqmfLk7E9KThPqKxLkKD-3W5KBWK4GodNAVDrZ4j=s96-c', 'VP', '2026-05-26 16:54:08.670702+00', NULL, 'CS', NULL, 30, NULL, NULL, 'Web Dev', true, false, 'email', true, true, false, 'public', 'light', 'en-us', false, NULL),
	('1d590522-9965-475d-9a90-cd1fefd2f169', 'bc1fa42c-92ed-4b25-a756-a308049df543', 'M. Saim Saleem', 'saim@gmail.com', 'teacher', NULL, 'MS', '2026-05-31 19:00:39.364224+00', NULL, 'CS', NULL, 20, NULL, NULL, 'Web Dev', false, false, 'email', true, true, false, 'public', 'light', 'en-us', false, NULL);


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."students" ("user_id", "student_code", "overall_percentile", "top_percentile", "accuracy_rate", "top_subject") VALUES
	('40c84058-ccf2-4d82-ae12-6ee82db8362c', 'STU-1275DA2C', 0.00, 0.00, 0.00, NULL),
	('1f1d4417-843b-4ef3-ace3-919bdbebc1ef', 'STU-42D5D1D7', 0.00, 0.00, 0.00, NULL),
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', 'STU-0BB2436E', 40.00, 0.00, 50.00, NULL);


--
-- Data for Name: behavioral_insights; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."teachers" ("user_id", "teacher_code", "students_avg_performance", "change_in_performance") VALUES
	('2fbe83f2-fe59-4426-bc5f-db40be9564df', 'TCH-D629651C', NULL, NULL),
	('1d590522-9965-475d-9a90-cd1fefd2f169', 'TCH-45324880', 84.4, 3.4);


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."subjects" ("id", "name", "code", "slug", "description", "icon_name", "color_theme", "created_by", "created_at", "updated_at") VALUES
	('c4b8eaf7-62fe-4b35-8158-e2cf4e3b597e', 'Cloud Computing', 'SE-415', 'cloud-computing', 'Distributed systems architecture, virtualization, cloud infrastructure scaling, and serverless architectures.', 'Cloud', 'sky', '1d590522-9965-475d-9a90-cd1fefd2f169', '2026-05-21 06:20:11.199602+00', '2026-06-21 06:57:47.72273+00'),
	('1dddd5fd-6c59-45b3-bf40-b80b815e564a', 'Information Security', 'CS-418', 'information-security', 'Principles of cryptography, network security defenses, identity management, and application vulnerability remediation.', 'ShieldAlert', 'amber', '1d590522-9965-475d-9a90-cd1fefd2f169', '2026-05-21 06:20:11.199602+00', '2026-06-21 06:57:47.72273+00'),
	('1f7852a2-d29b-4aa2-9665-c161afa6b5d1', 'Software Project Management', 'SE-402', 'software-project-management', 'Agile frameworks, estimation strategies, resource allocation, risk evaluation, and modern lifecycle team coordination.', 'KanbanSquare', 'indigo', '1d590522-9965-475d-9a90-cd1fefd2f169', '2026-05-21 06:20:11.199602+00', '2026-06-21 06:57:47.72273+00'),
	('0bc81ae6-0103-4374-8e13-1e1e01dfebe0', 'Software Quality Engineering', 'SE-123', 'software-quality-engineering', 'Testing methodologies, static analysis, continuous integration practices, quality assurance standards, and automated metrics.', 'Award', 'emerald', '1d590522-9965-475d-9a90-cd1fefd2f169', '2026-05-21 06:20:11.199602+00', '2026-06-21 06:57:47.72273+00'),
	('700cc49f-4eec-4d19-a2d7-07b03121f369', 'General Biology: Cell Structure and Function', 'BIO-101', 'general-biology-cell-structure-and-function', 'An introductory look into the building blocks of life. This course covers cellular anatomy, metabolic pathways, and the basics of genetic replication.', 'Atom', 'teal', '1d590522-9965-475d-9a90-cd1fefd2f169', '2026-05-25 10:36:14.388135+00', '2026-07-02 13:46:41.000982+00');


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."quizzes" ("id", "creator_id", "subject_id", "name", "description", "difficulty", "duration_minutes", "passing_marks", "join_code", "status", "question_count", "participant_count", "cover_gradient", "topics", "created_at", "closed_at", "total_marks", "grading_type") VALUES
	('07b0ae47-cb08-4983-9a9e-550b2b8b0988', '1d590522-9965-475d-9a90-cd1fefd2f169', '1dddd5fd-6c59-45b3-bf40-b80b815e564a', 'Viruses', 'This is a quiz about viruses and it''s types.', 'easy', 30, 5, 'SWRLZE', 'published', 2, 0, 'linear-gradient(to right, #2193b0, #6dd5ed)', '{Trojan,Worms,Bombs}', '2026-06-23 21:10:24.559311+00', NULL, 10, 'standard'),
	('23c7750b-9d57-4d65-901b-9cc391ac5272', '1d590522-9965-475d-9a90-cd1fefd2f169', '1dddd5fd-6c59-45b3-bf40-b80b815e564a', 'Cryptography & Network Hacking Defenses', 'Test your knowledge on mid-level network security layers, hashing functions, and avoiding common injection vulnerabilities.', 'Intermediate', 45, 75, 'ZLBJCZ', 'published', 20, 0, 'linear-gradient(to right, #ffe259, #ffa751)', '{AES,RSA,Firewalls,OWASP-Top-10}', '2026-05-24 21:05:48.86389+00', NULL, 100, NULL),
	('c0ebfa7c-0b8e-400e-9990-23de6b86b920', '1d590522-9965-475d-9a90-cd1fefd2f169', '1f7852a2-d29b-4aa2-9665-c161afa6b5d1', 'Agile Frameworks and Sprint Planning', 'Assess understanding of sprint ceremonies, story point calculations, and managing bottlenecks in software delivery.', 'Intermediate', 20, 65, 'TZHX3G', 'published', 10, 0, 'linear-gradient(to right, #9d50bb, #6e48aa)', '{Scrum,Kanban,Sprint-Planning,Burndown-Charts}', '2026-05-24 21:05:48.86389+00', NULL, 100, NULL),
	('374c5bb9-4d9c-4dbc-89fb-c84ba84a0121', '1d590522-9965-475d-9a90-cd1fefd2f169', '0bc81ae6-0103-4374-8e13-1e1e01dfebe0', 'Automated Testing & CI/CD Pipelines', 'Advanced evaluation on constructing reliable test suits, test-driven development cycles, and continuous integration workflows.', 'hard', 40, 80, 'ZHLRDY', 'published', 25, 0, 'linear-gradient(to right, #11998e, #38ef7d)', '{TDD,Unit-Testing,CI-CD,Selenium}', '2026-05-24 21:05:48.86389+00', NULL, 100, NULL),
	('1f7ebbb7-a0d5-4e80-9d2d-f87e96326f48', '1d590522-9965-475d-9a90-cd1fefd2f169', 'c4b8eaf7-62fe-4b35-8158-e2cf4e3b597e', 'AWS Core Services Fundamentals', 'An introductory quiz covering basic infrastructure-as-a-service concepts and cloud deployment strategies on AWS.', 'easy', 30, 70, 'ED2Z32', 'published', 15, 0, 'linear-gradient(to right, #2193b0, #6dd5ed)', '{EC2,S3,IAM,Cloud-Architecture}', '2026-05-24 21:05:48.86389+00', NULL, 100, NULL),
	('1ff5751a-4b5c-43a8-b21d-f400d3277ad7', '1d590522-9965-475d-9a90-cd1fefd2f169', '0bc81ae6-0103-4374-8e13-1e1e01dfebe0', 'Introduction to Web Development', 'This quiz tests your foundational knowledge of frontend web technologies.', 'easy', 30, 70, '4TQQ7L', 'published', 15, 0, 'linear-gradient(to right, #ff7e5f, #feb47b)', '{HTML,CSS,JavaScript}', '2026-05-25 09:51:42.592852+00', NULL, 100, NULL),
	('2bae1e0a-0afe-46cf-ab82-0134779a418a', '1d590522-9965-475d-9a90-cd1fefd2f169', '0bc81ae6-0103-4374-8e13-1e1e01dfebe0', 'Advanced Database Systems', 'A challenging assessment covering PostgreSQL internals, indexing strategy, and query plans.', 'easy', 10, 10, 'WWX7ZZ', 'published', 2, 0, 'linear-gradient(to right, #00c6ff, #0072ff)', '{PostgreSQL,Indexing,"Query Optimization"}', '2026-05-25 09:51:42.592852+00', NULL, 10, 'standard');


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questions" ("id", "quiz_id", "question", "type", "order_index", "marks", "options", "answer", "topic") VALUES
	('6b8f3278-1890-4fd3-86fe-5562313fa41d', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Which HTML5 element is used to display self-contained content, such as illustrations, diagrams, photos, or code listings?', 'multiple_choice', 1, 2, '["<aside>", "<section>", "<figure>", "<div>"]', '<figure>', 'HTML'),
	('3a98758f-e4ec-472f-aa10-a7c69795444d', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'The HTTP status code "403 Forbidden" means that the server understood the request, but refuses to authorize it.', 'true_false', 4, 1, '["True", "False"]', 'True', 'HTML'),
	('7994a6b5-5918-4c39-ab30-26e6240eb622', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'What does the "defer" attribute do when included in an HTML <script> tag?', 'multiple_choice', 8, 2, '["Stops HTML parsing completely", "Downloads script in background and runs it after parsing is done", "Executes the script immediately", "Loads scripts only on user interaction"]', 'Downloads script in background and runs it after parsing is done', 'HTML'),
	('b339c9ed-2368-4ecb-9ab2-809d4f655a28', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'What is a Semantic HTML element? Provide two clear examples of semantic tags and explain why they benefit web accessibility.', 'short_answer', 15, 3, NULL, NULL, 'HTML'),
	('1e82c850-4491-48c0-bffb-27419935c1cc', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Explain the difference between absolute, relative, and fixed positioning in CSS.', 'short_answer', 2, 5, NULL, NULL, 'CSS'),
	('f396bd89-2a81-47a4-aa5f-cdd9aa0a264d', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'In the CSS box model, the physical dimensions of an element are calculated by adding content, padding, and borders, but excluding the margin.', 'true_false', 6, 1, '["True", "False"]', 'True', 'CSS'),
	('59dd6931-0419-4802-869f-721def3ce2e0', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'In CSS Flexbox, which property is used to align flex items along the cross axis inside the flex container?', 'multiple_choice', 10, 2, '["justify-content", "align-items", "flex-direction", "wrap-content"]', 'align-items', 'CSS'),
	('aec26dee-d1c2-4804-a254-e0bed7597532', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Write a CSS Media Query that hides an element with the class ".sidebar" when the screen viewport width drops below 768px.', 'coding_response', 14, 4, NULL, NULL, 'CSS'),
	('2dd6f293-ffeb-491d-ba50-6a218307063f', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'What is a JavaScript closure? Provide a small code example demonstrating how a closure retains access to its outer scope variables.', 'coding_response', 3, 5, NULL, NULL, 'JavaScript'),
	('469bfafd-c172-4c30-9db7-e6db52097abf', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Which of the following array methods in JavaScript mutates (modifies) the original array instead of returning a new one?', 'multiple_choice', 5, 2, '["map()", "filter()", "splice()", "concat()"]', 'splice()', 'JavaScript'),
	('156dedb7-94be-4f47-9132-cd068fc7e29d', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Write a JavaScript function named "fetchUserData(userId)" that uses async/await to fetch data from "https://api.example.com/users/{userId}". Handle potential errors using a try/catch block.', 'coding_response', 9, 5, NULL, NULL, 'JavaScript'),
	('4d467345-eefd-4463-b7f8-7d9e53c29498', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'LocalStorage data automatically expires and clears itself when the browser tab or user session is closed.', 'true_false', 11, 1, '["True", "False"]', 'False', 'JavaScript'),
	('3c7604a3-0efd-4ada-9aca-cabd60d6500e', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Explain the purpose of the "key" prop when rendering dynamic lists in modern frontend libraries like React or Vue.', 'short_answer', 12, 3, NULL, NULL, 'JavaScript'),
	('c667dba0-0c25-47c7-a1d1-6b4c0f625e71', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Which HTTP method is structurally designed to append or patch modifications to an existing resource without replacing it completely?', 'multiple_choice', 13, 2, '["GET", "POST", "PUT", "PATCH"]', 'PATCH', 'JavaScript'),
	('8414ba88-149a-4dac-8b5d-8e4a3e384ecd', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', 'Describe what Cross-Site Scripting (XSS) is and name one method developers use to prevent it.', 'short_answer', 7, 4, NULL, NULL, 'JavaScript'),
	('3f50e720-9d6d-4d1b-987a-a764beff7baf', '07b0ae47-cb08-4983-9a9e-550b2b8b0988', 'What''s Trojan?', 'short-answer', 0, 5, '[]', NULL, NULL),
	('967f92fb-4014-475c-a252-1511ed545554', '07b0ae47-cb08-4983-9a9e-550b2b8b0988', 'What''s Bombs?', 'multiple-choice', 1, 5, '["Packed Explosion", "Something Else"]', 'Packed Explosion', NULL),
	('c787256a-58f0-4194-86b4-94da112f2dff', '2bae1e0a-0afe-46cf-ab82-0134779a418a', 'What''s DB?', 'short-answer', 0, 5, '[]', NULL, NULL),
	('e992ebfb-8a99-4ffe-b427-f9ebeacc16a9', '2bae1e0a-0afe-46cf-ab82-0134779a418a', 'What''s SQL?', 'multiple-choice', 1, 5, '["Sequencing smth", "idk", "idc"]', 'Sequencing smth', NULL);


--
-- Data for Name: question_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."question_responses" ("id", "student_id", "question_id", "selected_option", "time_spent_sec", "flagged_for_review", "text_response", "is_correct") VALUES
	('84264417-f45d-4beb-906d-4b036fb4048e', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '6b8f3278-1890-4fd3-86fe-5562313fa41d', '<figure>', NULL, false, NULL, NULL),
	('b3b42048-b3bd-436b-97fe-60c046a92491', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '1e82c850-4491-48c0-bffb-27419935c1cc', NULL, NULL, false, 'dsadasd', NULL),
	('00e4ca23-f3f1-42ee-b5a1-57f41e5db733', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '2dd6f293-ffeb-491d-ba50-6a218307063f', NULL, NULL, false, 'dsadasda', NULL),
	('8dc97a15-2ef1-462c-b191-6cb3b5456e7b', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '3a98758f-e4ec-472f-aa10-a7c69795444d', 'True', NULL, false, NULL, NULL),
	('aa19c3ff-b18b-46dd-9e73-26d420580b60', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '469bfafd-c172-4c30-9db7-e6db52097abf', 'filter()', NULL, false, NULL, NULL),
	('8ce20e1a-15b0-47f4-9808-ac254442278f', '40c84058-ccf2-4d82-ae12-6ee82db8362c', 'f396bd89-2a81-47a4-aa5f-cdd9aa0a264d', 'False', NULL, false, NULL, NULL),
	('f4fc0101-d64f-4d0e-b352-955e65c514e6', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '8414ba88-149a-4dac-8b5d-8e4a3e384ecd', NULL, NULL, false, 'dsadas', NULL),
	('ee67f631-4236-45a8-bbe1-a2a039f3652c', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '7994a6b5-5918-4c39-ab30-26e6240eb622', 'Downloads script in background and runs it after parsing is done', NULL, false, NULL, NULL),
	('7d78e73c-acbe-46e1-afbd-07501bc1ebd1', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '156dedb7-94be-4f47-9132-cd068fc7e29d', NULL, NULL, false, 'dasda', NULL),
	('d67d643b-2b51-47ab-821d-59874fb98292', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '59dd6931-0419-4802-869f-721def3ce2e0', 'flex-direction', NULL, false, NULL, NULL),
	('865fea6b-3673-47c5-933e-2a25b3ad7d5c', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '4d467345-eefd-4463-b7f8-7d9e53c29498', 'True', NULL, false, NULL, NULL),
	('f27d2fee-f4fa-41c1-b1e8-b44cce91be05', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '3c7604a3-0efd-4ada-9aca-cabd60d6500e', NULL, NULL, false, 'sdadad', NULL),
	('0435de70-df75-4db8-9817-1c1f1ec52f9b', '40c84058-ccf2-4d82-ae12-6ee82db8362c', 'c667dba0-0c25-47c7-a1d1-6b4c0f625e71', 'POST', NULL, false, NULL, NULL),
	('cd328526-d1b4-4743-83b1-9c9a8c892590', '40c84058-ccf2-4d82-ae12-6ee82db8362c', 'aec26dee-d1c2-4804-a254-e0bed7597532', NULL, NULL, false, 'dsadsa', NULL),
	('ab33ce9f-8742-4385-891c-d55304526f51', '40c84058-ccf2-4d82-ae12-6ee82db8362c', 'b339c9ed-2368-4ecb-9ab2-809d4f655a28', NULL, NULL, false, 'dsadsa', NULL);


--
-- Data for Name: quiz_affiliations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."quiz_affiliations" ("student_id", "quiz_id", "assigned_at", "status") VALUES
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', '1ff5751a-4b5c-43a8-b21d-f400d3277ad7', '2026-05-25 09:56:39.472217+00', 'completed'),
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', '1f7ebbb7-a0d5-4e80-9d2d-f87e96326f48', '2026-05-24 21:20:49.849465+00', 'available'),
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', '23c7750b-9d57-4d65-901b-9cc391ac5272', '2026-05-24 21:20:49.849465+00', 'available'),
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', '374c5bb9-4d9c-4dbc-89fb-c84ba84a0121', '2026-05-24 21:20:49.849465+00', 'available'),
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', 'c0ebfa7c-0b8e-400e-9990-23de6b86b920', '2026-05-24 21:20:49.849465+00', 'available'),
	('d0dd2297-a4e1-4769-ac11-43ef569adcb1', '2bae1e0a-0afe-46cf-ab82-0134779a418a', '2026-05-25 09:56:39.472217+00', 'available');


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: student_teacher_affiliations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."student_teacher_affiliations" ("teacher_id", "student_id") VALUES
	('1d590522-9965-475d-9a90-cd1fefd2f169', '1f1d4417-843b-4ef3-ace3-919bdbebc1ef'),
	('1d590522-9965-475d-9a90-cd1fefd2f169', '40c84058-ccf2-4d82-ae12-6ee82db8362c');


--
-- Data for Name: subject_affiliations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."subject_affiliations" ("subject_id", "student_id", "taken_at") VALUES
	('0bc81ae6-0103-4374-8e13-1e1e01dfebe0', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '2026-05-25 10:30:27.93247+00'),
	('1dddd5fd-6c59-45b3-bf40-b80b815e564a', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '2026-05-25 10:30:27.93247+00'),
	('1f7852a2-d29b-4aa2-9665-c161afa6b5d1', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '2026-05-25 10:30:27.93247+00'),
	('c4b8eaf7-62fe-4b35-8158-e2cf4e3b597e', '40c84058-ccf2-4d82-ae12-6ee82db8362c', '2026-05-25 10:30:27.93247+00'),
	('1f7852a2-d29b-4aa2-9665-c161afa6b5d1', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '2026-06-21 15:56:32.817979+00'),
	('1dddd5fd-6c59-45b3-bf40-b80b815e564a', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '2026-06-21 15:56:32.817979+00'),
	('c4b8eaf7-62fe-4b35-8158-e2cf4e3b597e', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '2026-06-21 15:56:32.817979+00'),
	('0bc81ae6-0103-4374-8e13-1e1e01dfebe0', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '2026-06-21 15:56:32.817979+00'),
	('700cc49f-4eec-4d19-a2d7-07b03121f369', 'd0dd2297-a4e1-4769-ac11-43ef569adcb1', '2026-06-21 15:56:32.817979+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('avatars', 'avatars', NULL, '2026-05-10 12:38:27.223636+00', '2026-05-10 12:38:27.223636+00', true, false, 5242880, '{image/jpeg,image/png,image/webp,image/gif}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 220, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict T9KyUbXqEUibufjoflJJE5xebrjmzU5bLl8rgSvRiHGiuMzi65R9T1my0CudA6H

RESET ALL;
