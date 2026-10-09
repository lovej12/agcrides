-- AGCRIDES seed: 2 routes, stops, 2 buses. Demo coords (see DECISIONS.md).
insert into routes (id, name, origin, destination) values
 ('R1','AGC → Batala','AGC Main Gate','Batala Bus Stand'),
 ('R2','AGC → Hall Gate','AGC Main Gate','Hall Gate')
on conflict (id) do nothing;

insert into stops (id, route_id, name, seq, lat, lng, scheduled_offset_min) values
 ('R1S1','R1','AGC Main Gate',1,31.5770,74.9820,0),
 ('R1S2','R1','Manawala Chowk',2,31.6100,74.9300,8),
 ('R1S3','R1','Verka Chowk',3,31.6512,74.8726,16),
 ('R1S4','R1','Kathu Nangal',4,31.7150,74.9400,26),
 ('R1S5','R1','Jaintipura',5,31.7700,75.1200,36),
 ('R1S6','R1','Batala Bus Stand',6,31.8196,75.2028,48),
 ('R2S1','R2','AGC Main Gate',1,31.5770,74.9820,0),
 ('R2S2','R2','Celebration Mall',2,31.6105,74.8801,12),
 ('R2S3','R2','Company Bagh',3,31.6310,74.8650,20),
 ('R2S4','R2','Railway Station',4,31.6338,74.8700,26),
 ('R2S5','R2','Hall Gate',5,31.6345,74.8600,32)
on conflict (id) do nothing;

insert into buses (id, number, route_id, capacity) values
 ('BUS 01','BUS 01','R1',40),
 ('BUS 02','BUS 02','R2',40)
on conflict (id) do nothing;

-- Device tokens: store SHA-256 only. Raw demo tokens for simulator:
-- demo-token-BUS-01 / demo-token-BUS-02 (hash locally, insert hash, never commit raw in prod)
