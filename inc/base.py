import json

from jsonmodels import models


class ModelList(list):
    """
    Helper class for loading and filtering a list of Models
    """

    def __init__(self, source=None, klass=None, field_map={}):
        """
        source: absolute path to json file
        klass: the model class to use when loading and instantiating models
        """
        self.klass = klass
        self.field_map = field_map
        self.source = source
        if source and klass and field_map:
            self._load_models()

    def filter(self, *args, **kwargs):
        def func(model):
            ret = True
            for key, val in kwargs.items():
                if getattr(model, key) != val:
                    ret = False
            return ret
        return filter(func, self)

    def get(self, *args, **kwargs):
        result = self.filter(*args, **kwargs)
        if len(result) > 1:
            raise RuntimeError('Found multiple models matching specified filter')
        return result[0]

    def _load_json(self):
        with open(self.source) as f:
            return json.loads(f.read())

    def _load_models(self):
        data = self._load_json()

        models = []
        for d in data:
            model = {}
            for field, desc in self.field_map.items():
                model[field] = self.klass.process_field(field, d[desc])
            models.append(self.klass(**model))

        self.extend(models)


class BaseModel(models.Base):
    """
    Map of Model fields and their corresponding headers/keys in the source file
    """
    field_map = {}

    """
    ModelList handles loading all of the model data and provides
    helpers for filtering, mapping, reducing
    """
    objects = ModelList()

    def get_related(self, model=None, attribute='case_number'):
        """
        Lookup other Models with the same case_number attribute
        """
        return model.objects.filter(lambda x: getattr(x, attribute) == getattr(self, attribute))

    @staticmethod
    def process_field(field, value):
        """
        Can be used for special treatment of specific fields
        """
        return value
