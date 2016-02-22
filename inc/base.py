import json

from jsonmodels import models

from GenericCache import GenericCache
#from GenericCache.decorators import cached


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
            for key, val in kwargs.items():
                if getattr(model, key) != val:
                    return False
            return True
        return filter(func, self)

    def get(self, *args, **kwargs):
        result = self.filter(*args, **kwargs)
        if len(result) > 1:
            raise RuntimeError('Found multiple models matching specified filter')
        return result[0]

    def to_json(self):
        return json.dumps([item.to_struct() for item in self])

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
    type = 'base'

    """
    Map of Model fields and their corresponding headers/keys in the source file
    """
    field_map = {}

    """
    ModelList handles loading all of the model data and provides
    helpers for filtering, mapping, reducing
    """
    objects = ModelList()

    cache = GenericCache()

    def get_related(self, model=None, attribute='case_number'):
        key = hash('%s-%s-%s' % (self.__hash__(), model.type, attribute))
        cached = self.cache.fetch(key)

        if cached:
            return cached

        """
        Lookup other Models with the same case_number attribute
        """
        # Make sure both objects have the attribute we're looking for.
        # Raises an exception if one model is missing the attribute we're looking to match on.
        getattr(self, attribute)
        getattr(model.objects[0], attribute)

        result = model.objects.filter(**{attribute: getattr(self, attribute)})
        self.cache.insert(key, result)
        return result

    @staticmethod
    def process_field(field, value):
        """
        Can be used for special treatment of specific fields
        """
        return value
