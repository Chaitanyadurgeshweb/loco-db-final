"""Normalise the source workbook -> clean CSVs + issues report. Never invents data."""
import re, json, pandas as pd
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
df = pd.read_excel(ROOT/'data/raw/Loco_Data_Base.xlsx')
total_read = len(df)
df['src_row'] = df.index + 2
issues = []
def issue(row, kind, detail): issues.append({'source_row': row, 'issue_type': kind, 'detail': detail})

# The sheet's "Division_Code/Name" columns hold ZONES (e.g. SER = South Eastern Railway).
ZONE = {'SCOR':'SCR','SCR':'SCR','ECOR':'ECoR'}
df['zone_code'] = df['Division_Code'].str.strip().map(lambda z: ZONE.get(z.upper(), z))
for c in ['SHED_Code','SHED_Name','SHED LOCATION','Google Maps Location','Division_Name']:
    df[c] = df[c].str.strip()
df['class_code'] = df['Loco Type'].str.strip().str.upper()
mask = df['class_code'] == 'WAG7BHEL'
for r in df.loc[mask,'src_row']: issue(r,'class_alias','WAG7BHEL treated as WAG7 (manufacturer BHEL kept separately)')
df.loc[mask,'class_code'] = 'WAG7'
df['kavach'] = df['Kavach Make'].str.strip().str.upper().replace({'GTRONICS':'GGTRONICS'})
df['mfr'] = df['PU Name'].str.strip().str.upper()

# Duplicate loco numbers after normalization
dups = df[df.duplicated('Loco No', keep=False)]
for n, g in dups.groupby('Loco No'):
    same = g[['zone_code','SHED_Code','class_code','mfr']].drop_duplicates().shape[0] == 1
    issue(int(g.src_row.iloc[0]),'duplicate_number',f'{n}: rows {g.src_row.tolist()} '+('identical after normalization; kept first' if same else 'CONFLICT; kept first, needs review'))
df = df.drop_duplicates('Loco No', keep='first')

# Shed zones confirmed (shed zone is authoritative for its locos)
SHED_ZONE = {'BLEE':'WR','KJMD':'SWR','WATE':'SCR'}
for sh, z in SHED_ZONE.items():
    m = (df.SHED_Code == sh) & (df.zone_code != z)
    for r in df.loc[m,'src_row']: issue(r,'zone_corrected',f'Shed {sh}: zone {df.loc[df.src_row==r,"zone_code"].iloc[0]} -> {z} (confirmed)')
    df.loc[df.SHED_Code == sh,'zone_code'] = z
    df.loc[df.SHED_Code == sh,'Division_Name'] = df.loc[df.zone_code == z,'Division_Name'].mode().iloc[0]
# Sheds: zone only set when unambiguous
sz = df.groupby('SHED_Code')['zone_code'].unique()
amb = {k: sorted(v) for k, v in sz.items() if len(v) > 1}
for k, v in amb.items():
    issue(0,'shed_zone_conflict',f'Shed {k} appears under zones {v}; shed zone left blank, each loco keeps its recorded zone')
sheds = df.drop_duplicates('SHED_Code')[['SHED_Code','SHED_Name','SHED LOCATION','Google Maps Location']].copy()
sheds.columns = ['code','name','location','maps_query']
sheds['zone_code'] = sheds.code.map(lambda c: None if c in amb else sz[c][0])
sheds['slug'] = sheds.code.str.lower()
zones = df.drop_duplicates('zone_code')[['zone_code','Division_Name']].rename(columns={'zone_code':'code','Division_Name':'name'})
mf = pd.DataFrame({'code': sorted(df.mfr.dropna().unique())}); mf['slug'] = mf.code.str.lower()
slug = lambda c: re.sub(r'(?<=[A-Z])(?=\d)','-',c).lower()
cl = pd.DataFrame({'code': sorted(df.class_code.unique())}); cl['slug'] = cl.code.map(slug)
locos = df[['Loco No','class_code','SHED_Code','zone_code','mfr','kavach','src_row']].rename(columns={'Loco No':'number','SHED_Code':'shed_code','mfr':'manufacturer_code','kavach':'kavach_make'})
out = ROOT/'data/clean'
for n, t in dict(zones=zones, sheds=sheds, manufacturers=mf, loco_classes=cl, locomotives=locos).items():
    t.to_csv(out/f'{n}.csv', index=False)
pd.DataFrame(issues).to_csv(out/'import_issues.csv', index=False)
summary = dict(rows_read=total_read, locomotives=len(locos), zones=len(zones), sheds=len(sheds), classes=len(cl), manufacturers=len(mf), issues=len(issues), ambiguous_sheds=amb)
(out/'summary.json').write_text(json.dumps(summary, indent=2)); print(json.dumps(summary, indent=2))
