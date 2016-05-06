import json

def prep_officer_data():
    with open('data/casecops.json', 'r') as f:
        casecops = json.loads(f.read())

    with open('data/officers_full.json', 'r') as f:
        officers = json.loads(f.read())

    result = []
    seen = []

    for cop in casecops:
        try:
            if (seen.index(cop.get('cop')) >= 0):
                print "Already saw officer %s" % cop.get('cop')
                existing_cop = result[seen.index(cop.get('cop'))]
                print "Check ID: %s" % existing_cop.get('id')

                print "Adding case no. %s to existing data" % cop.get('case_no')
                existing_cop['case_numbers'].append(cop.get('case_no'))
                print ""

                continue
        except ValueError:

            officer_data = filter(lambda x: x.get('id', None) == cop.get('cop', None), officers)[0]

            """
            Unset some keys we're going to replace with data from the officers sheet or
            just aren't using.
            """
            delete_these = [
                'officer_atty',
                'officer_atty_firm',
                'case',
                'cop_first_name',
                'cop_middle_initial',
                'cop_last_name',
                'entered_by',
                'entered_when',
                'fact_checked_by',
                'fact_checked_when',
                'matched_by',
                'matched_when'
            ]

            for key in delete_these:
                del cop[key]

            """
            Use identifying info from officers sheet:
            - First name
            - Middle initial
            - Last name
            - Gender
            - Race
            - Dates of service
            - Rank
            - Unit
            """
            use_these = [
                'first_name',
                'last_name',
                'middle_init',
                'sex',
                'race',
                'appointed_date',
                'resignation_date',
                'position_desc'
            ]

            for key in use_these:
                cop[key] = officer_data[key]

            # Start a list of case numbers in the event
            # this officer has been involved in multiple
            cop['case_numbers'] = [cop.get('case_no'), ]

            # Map fields to what we're using in the app already
            field_map = {
                'appointed': 'appointed_date',
                'resigned': 'resignation_date',
                'prefix': "position_desc",
                'badge_number': 'badge_no',
                'case_number': 'case_no',
                'id': 'cop',
                'first': 'first_name',
                'middle': 'middle_init',
                'last': 'last_name',
                'race': 'race',
            }

            for use, dont in field_map.items():
                cop[use] = cop[dont]
                if use != dont:
                    del cop[dont]

            result.append(cop)
            seen.append(cop.get('id'))

    with open('data/officers.json', 'w+') as f:
        f.write(json.dumps(result))
