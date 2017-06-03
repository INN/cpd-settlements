# -*- coding: utf-8 -*-
import csv
import json
import StringIO

from tarbell.oauth import get_drive_api

SPREADSHEETS = {
    # Cases
    # https://docs.google.com/spreadsheets/d/1YnDgLxycT-jwjuxwBuuJjlFCXPk4u5P_3yA57gPWHgo/edit#gid=1235485359
    # - id
    # - CaseNumber
    # - DateFiled
    # - DateClosed
    # - Judge
    # - PlaintiffsLeadAttorney
    # - PlaintiffsAttorneyLawFirm
    # - CitysLeadAttorney
    # - CitysAttorneyLawFirm
    # - MagistrateJudge
    # - DateofIncident
    # - LocationListed
    # - StreetAddress
    # - City
    # - State
    # - EnteredBy
    # - Fact-checkedby
    # - Differences
    # - Latitude
    # - Longitude
    # - CensusPlaceFips
    # - CensusMsaFips
    # - CensusMetDivFips
    # - CensusMcdFips
    # - CensusCbsaMicro
    # - CensusCbsaFips
    # - CensusBlock
    # - CensusBlockGroup
    # - CensusTract
    # - CensusCountyFips
    # - CensusStateFips
    # - naaccrCertCode
    # - MNumber
    # - MPreDirectional
    # - MName
    # - MSuffix
    # - MCity
    # - MState
    # - Neighborhood
    # - Narrative
    # - primary_cause
    # - federal_causes
    # - state_causes
    # - interaction_type
    # - officers
    # - victims
    # - misconduct_type
    # - weapons_used
    # - outcome
    # - tags
    #'cases': '1DyJz3uWjZXBFZIVpV1y0FxBElfA29U4NR41nX_5XT9w',
    'cases': '1YnDgLxycT-jwjuxwBuuJjlFCXPk4u5P_3yA57gPWHgo',

    # Victims
    # https://docs.google.com/spreadsheets/d/1_nUXS1jdWv_j5av368Reer3TBzQPBKnmvsBm2stKNsQ/edit#gid=0
    # - Timestamp
    # - Case number
    # - Victim 1
    # - Victim 1 Race
    # - Victim 1 Age (If known)
    # - Victim 1 Gender
    # - Victim 1 Deceased
    # - Victim 2
    # - Victim 3
    # - Victim 4
    # - Victim 5
    # - Victim 6
    # - Victim 7
    # - Victim 8
    # - More Victims?
    # - Notes/Flags
    # - Entered By
    # - Fact-checked by
    #'victims': '1bRYEa8tzryjbs8HpvDqnu15oHoLLlBO93GsAaIOrFvA',
    'victims': '1_nUXS1jdWv_j5av368Reer3TBzQPBKnmvsBm2stKNsQ',

    # Officers
    # https://docs.google.com/spreadsheets/d/1Zs-3f0vrensScGo3lnnCf7xKrprric5M5HokgmENNHU/edit#gid=1038247715
    # - id
    # - last_name
    # - first_name
    # - middle_init
    # - sex
    # - race
    # - dob_year
    # - current_age
    # - status
    # - appointed_date
    # - position_code
    # - position_desc
    # - cpd_unit
    # - cpd_unit_desc
    # - resignation_date
    # - slug
    # - notes
    #'officers_full': '18TByyAf5TB4AiC8zNEkMWiOREHLAi6dDwzrLOGh5b14',
    'officers_full': '1Zs-3f0vrensScGo3lnnCf7xKrprric5M5HokgmENNHU',

    # casecops -- matches the officers dataset to the case dataset
    # https://docs.google.com/spreadsheets/d/1dlR4egtqSVQpw01d3VFwrEHDDvv2Bg7Y7hVWzoZRzi8/edit#gid=131997155
    # - id
    # - case_no
    # - slug
    # - cop_first_name
    # - cop_middle_initial
    # - cop_last_name
    # - badge_no
    # - officer_atty
    # - officer_atty_firm
    # - entered_by
    # - entered_when
    # - fact_checked_by
    # - fact_checked_when
    # - matched_by
    # - matched_when
    # - note
    # - flag
    # - case_id
    # - cop_id
    #'casecops': '1r3G3mmJ9fQV3fOJt3zKDnpf5-jzm78GJErSiLm1_H8A',
    'casecops': '1dlR4egtqSVQpw01d3VFwrEHDDvv2Bg7Y7hVWzoZRzi8',

    # Payments: matches case to payments to payees.
    # https://docs.google.com/spreadsheets/d/1gTcPfSEJ_qAZldr23BdW97NWRDa-kRSY1VZ3zf6JOGY/edit#gid=822728219
    # - case_num
    # - payee
    # - payment
    # - fees_costs
    # - primary_case
    # - disposition
    # - date_paid
    #'payments': '1IC5B7qoVkCMmzq6abrTkokq2Ua6nBQFmo4-0m-mPVgQ',
    'payments': '1gTcPfSEJ_qAZldr23BdW97NWRDa-kRSY1VZ3zf6JOGY',
}


def main():
    download_data()


def download_data():
    api = get_drive_api()

    for filename, key in SPREADSHEETS.items():
        print "Retrieving %s data..." % filename
        # Retrieve the spreadsheet from Drive
        spreadsheet = api.files().get(fileId=key).execute()

        # Get the CSV download link
        links = spreadsheet.get('exportLinks')
        csv_link = links.get('text/csv')

        # Download the CSV
        resp, content = api._http.request(csv_link)

        # Convert the CSV content to a serializable Python data structure
        data = StringIO.StringIO(content)
        reader = csv.DictReader(data)
        rows = [row for row in reader]

        # Write csv file
        with open('data/%s.csv' % filename, 'wb') as csvf:
            print "Exporting to CSV: data/%s.csv" % filename
            csvf.write(content)

        # Write the JSON data to file
        with open('data/%s.json' % filename, 'wb') as jsonf:
            print "Exporting to JSON: data/%s.json" % filename
            jsonf.write(json.dumps(rows))

    print 'Done.'


if __name__ == '__main__':
    main()
